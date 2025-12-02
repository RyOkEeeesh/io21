# io21 課題1
# GPIO26 を出力としてLEDに給電(3.3v)する

import RPi.GPIO as GPIO
from time import sleep

PORT = 26
GPIO.setmode(GPIO.BCM)
GPIO.setup(PORT, GPIO.OUT, initial=GPIO.LOW)

while True:
  try:
    GPIO.output(PORT, GPIO.HIGH)  # LED ON
    sleep(1)
    GPIO.output(PORT, GPIO.LOW)   # LED OFF
    sleep(1)
  except KeyboardInterrupt:
    break

GPIO.cleanup()
