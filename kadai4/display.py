import smbus
from time import sleep
import subprocess
import threading

i2c = smbus.SMBus(1)
addr = 0x3e
_command = 0x00
_data = 0x40
lcd_columns = 16
lcd_rows = 2

def command(code):
  i2c.write_byte_data(addr, _command, code)
  sleep(0.05)

def display(displayText):
  command(0x80)
  for i in range(lcd_columns // 2):
    i2c.write_byte_data(addr, _data, displayText[i])
  command(0xC0)
  for i in range(lcd_columns // 2, lcd_columns):
    i2c.write_byte_data(addr, _data, displayText[i])

def writeLCD(message):
  strlist = [ord(c) for c in message]
  maxDisLen = lcd_columns

  if len(strlist) == 0:
    command(0x01)
    return

  if len(strlist) < maxDisLen:
    strlist += [ord(' ')] * (maxDisLen - len(strlist))

  if len(strlist) <= maxDisLen:
    display(strlist)
  else:
    for i in range(len(strlist) - maxDisLen + 1):
      display(strlist[i:i+maxDisLen])
      sleep(0.3)

def initLCD():
  command(0x38)
  command(0x39)
  command(0x14)
  command(0x73)
  command(0x56)
  command(0x6c)
  sleep(0.1)
  command(0x38)
  command(0x0C)
  command(0x01)
  sleep(0.1)

# === Node.js ログ監視用コード ===
node_file = "school/io21/kadai4/server.js"
process = subprocess.Popen(
  ["node", node_file],
  stdout=subprocess.PIPE,
  stderr=subprocess.STDOUT,
  text=True
)

log_buffer = []
buffer_lock = threading.Lock()
MAX_BUFFER = 50

def read_node_logs():
  while True:
    line = process.stdout.readline()
    if line == "" and process.poll() is not None:
      break
    if line:
      with buffer_lock:
        log_buffer.append(line.strip())
        if len(log_buffer) > MAX_BUFFER:
            log_buffer.pop(0)

threading.Thread(target=read_node_logs, daemon=True).start()

# === メインループ ===
if __name__ == "__main__":
  initLCD()
  last_displayed = ""

  while True:
    with buffer_lock:
      if log_buffer:
        current_log = log_buffer.pop(0)
      else:
        current_log = None

    if current_log:
      last_displayed = current_log
      writeLCD(current_log)
    else:
      if last_displayed:
        writeLCD(last_displayed)

    sleep(2)
