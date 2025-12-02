#!/usr/bin/python3
#
import RPi.GPIO as GPIO
import time
import dht11
from datetime import datetime
import csv

GPIO.setwarnings(True)
GPIO.setmode(GPIO.BCM)

instance = dht11.DHT11(pin=4)

LOG_FILE_PATH = '/home/kaji/school/io21/kadai05/kadai05.csv'

def getResult():
    result = instance.read()
    if result.is_valid():
        return result
    return False


def main():
    result = getResult()
    while not result:
        time.sleep(1)
        result = getResult()

    with open(LOG_FILE_PATH, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        if f.tell() == 0:
            writer.writerow(['time', 'temperature', 'humidity'])

        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        writer.writerow([now, result.temperature, result.humidity])

    GPIO.cleanup()


if __name__ == '__main__':
    main()
