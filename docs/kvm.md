# Проверка KVM

## Окружение

ОС: macOS
Процессор: Apple M4 (ARM64)
KVM: недоступен

## Проверка

Команды, которые были выполнены:

    sysctl kern.hv_support
    uname -m
    ls /dev/kvm

Результат:

- sysctl kern.hv_support возвращает 1. Это означает, что доступен Hypervisor.framework, но это не KVM.
- uname -m возвращает arm64.
- ls /dev/kvm возвращает "No such file or directory". Устройства /dev/kvm нет.

Вывод: KVM на macOS недоступен. KVM - это модуль ядра Linux, на macOS его нет. На процессорах Apple Silicon также нет поддержки VT-x или AMD-V, которые нужны для KVM.

## Как было бы на Linux-хосте

На Linux-хосте с поддержкой виртуализации шаги были бы такими.

Проверка поддержки:

    egrep -c '(vmx|svm)' /proc/cpuinfo

Если результат больше нуля, поддержка есть.

Установка KVM и утилит:

    sudo apt update
    sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients virtinst bridge-utils

Проверка:

    ls /dev/kvm
    kvm-ok

Запуск службы:

    sudo systemctl enable --now libvirtd

Добавление пользователя в группы:

    sudo usermod -aG libvirt,kvm $USER

Создание VM через virt-install:

    sudo virt-install \
      --name bakery-vm \
      --ram 2048 \
      --vcpus 2 \
      --disk path=/var/lib/libvirt/images/bakery-vm.qcow2,size=10 \
      --os-variant ubuntu22.04 \
      --network network=default \
      --graphics none \
      --console pty,target_type=serial \
      --location 'http://archive.ubuntu.com/ubuntu/dists/jammy/main/installer-amd64/' \
      --extra-args 'console=ttyS0,115200n8 serial'

После установки VM:

    sudo virsh domifaddr bakery-vm
    ssh ubuntu@<IP>

Установка Docker внутри VM:

    sudo apt update
    sudo apt install -y docker.io docker-compose-v2
    sudo usermod -aG docker $USER

Копирование приложения и запуск:

    scp -r bakery-app ubuntu@<IP>:/home/ubuntu/
    ssh ubuntu@<IP>
    cd bakery-app
    docker compose up -d --build

Проверка с ноутбука: открыть в браузере http://<IP_VM>:8080. Должна открыться страница пекарни, которая получает данные с бэкенда.
