# !/usr/bin/python3

import RPi.GPIO as GPIO
from time import sleep
import sys

num = int(sys.argv[1])

PORT = [13, 19, 26]
GPIO.setmode(GPIO.BCM)
GPIO.setup(PORT, GPIO.OUT, initial=GPIO.LOW)

if num >= 0 and num < 8:
  num = list(format(num, '03b'))
  for i in range(len(num)):
    if int(num[i]):
      GPIO.output(PORT[i], GPIO.HIGH)
  sleep(5)

GPIO.cleanup()
