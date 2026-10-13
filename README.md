# Лабораторная работа: Docker Compose, KVM и Ansible

Выполнила: Зубова Юлия 24кнт4

## Что сделано

Продолжение первой лабораторной работы. В репозиторий добавлено приложение "Пекарня", состоящее из фронтенда и бэкенда. Фронтенд получает данные с бэкенда через HTTP.

Приложение запускается через Docker Compose. Также подготовлены файлы для уровней 7, 9 и 10 (KVM и Ansible) и workflow для бонуса.

## Структура репозитория

    bakery-app/
      backend/
        app.py
        requirements.txt
        Dockerfile
      frontend/
        index.html
        style.css
        script.js
        nginx.conf
        Dockerfile
      docker-compose.yml

    ansible/
      playbook.yml
      inventory.ini

    docs/
      kvm.md

    .github/workflows/
      main.yml
      trivy.yml

Описание:

- bakery-app - приложение из двух сервисов.
- backend - Python FastAPI, отдаёт список товаров.
- frontend - статика на nginx.
- docker-compose.yml - описание двух сервисов.
- ansible - файлы для уровней 9 и 10.
- docs - описание проверки KVM для уровня 7.
- .github/workflows - CI: main.yml (основная проверка) и trivy.yml (бонус).

## Уровень 5. Docker Compose

Приложение состоит из двух сервисов:

- backend - Python 3.12 + FastAPI. Отдаёт список товаров по адресу /api/products.
- frontend - nginx на alpine. Отдаёт статику и проксирует запросы /api/* на backend.

Схема работы:

    Ноутбук (порт 8080)
        |
        v
    frontend (nginx, порт 80)
        |
        | запросы /api/* идут через proxy_pass
        v
    backend (FastAPI, порт 8000)

Команды запуска:

    cd bakery-app
    docker compose up --build

Проверка:

- Сайт открывается по адресу http://localhost:8080
- API возвращает JSON по адресу http://localhost:8080/api/products

Что показывает сайт:

- Вкладка "Товары" - список из 9 товаров, загружается с бэкенда.
- Вкладка "Корзина" - добавление и удаление товаров, подсчёт суммы.
- Вкладка "Личный кабинет" - сохранение имени и email, история заказов.

## Уровень 7. KVM

На ноутбуке используется macOS с процессором Apple M4 (архитектура ARM64). KVM на этой платформе недоступен, потому что KVM - это модуль ядра Linux, и на macOS его нет.

Подробное описание проверки и команд для Linux-хоста находится в файле docs/kvm.md.

Если описывать здесь, мою проверку и выводы, то я выполнила следующие команды

- Команда sysctl kern.hv_support показывает поддержку Hypervisor.framework, но это не KVM.
- Команда ls /dev/kvm возвращает "No such file or directory", то есть устройства KVM нет.
- На Linux-хосте с поддержкой VT-x или AMD-V можно установить qemu-kvm, libvirt и создать VM через virt-install. После этого внутри VM устанавливается Docker и запускается приложение через docker compose.

## Уровень 9. Ansible

Playbook ansible/playbook.yml автоматизирует развёртывание приложения на VM. Что он делает:

1. Обновляет apt и устанавливает Docker и Docker Compose.
2. Запускает и включает службу Docker.
3. Добавляет пользователя в группу docker.
4. Создаёт папку для приложения.
5. Копирует папку bakery-app на VM.
6. Запускает docker compose.
7. Проверяет, что фронтенд отвечает по адресу http://localhost:8080.

Inventory ansible/inventory.ini содержит адрес VM и параметры подключения по SSH.

Запуск:

    cd ansible
    ansible-playbook -i inventory.ini playbook.yml

После запуска приложение доступно с ноутбука по адресу http://IP_VM:8080.

## Уровень 10. Идемпотентность playbook

Playbook можно запускать повторно без ручного исправления состояния. Это обеспечено тем, что все задачи используют модули Ansible, которые проверяют текущее состояние перед изменениями:

- apt  не переустанавливает уже установленные пакеты.
- systemd  не перезапускает уже запущенную службу без необходимости.
- user не создаёт пользователя повторно.
- file  не изменяет существующую папку, если она уже есть.
- synchronize  копирует только изменённые файлы.
- community.docker.docker_compose_v2  не пересоздаёт контейнеры, если их конфигурация не изменилась.
- uri  только проверяет доступность, ничего не меняет.

Если запустить playbook два раза подряд, второй запуск должен завершиться успешно, а у большинства задач в отчёте будет changed=0.

## Бонус. Trivy в GitHub Actions

Файл .github/workflows/trivy.yml описывает workflow, который запускается при push и pull request в ветку main.

Что делает workflow:

1. Собирает Docker-образ bakery-backend.
2. Запускает Trivy и сканирует образ на уязвимости уровня CRITICAL и HIGH.
3. То же самое делает для образа bakery-frontend.
4. Результат отображается в логе workflow на вкладке Actions.

