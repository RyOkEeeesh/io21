from flask import Flask, request, jsonify
from flask_cors import CORS
import RPi.GPIO as GPIO

class Status:
  def __init__(self):
    self.working = False
    self.status = None

  def	setStatus(self, s):
    self.status = s

  def changeWorkStatus(self, bool):
    self.working = bool

c = Status()
app = Flask(__name__)
CORS(app)

PORT =  [13, 19, 26]
GPIO.setmode(GPIO.BCM)
GPIO.setup(PORT, GPIO.OUT, initial=GPIO.LOW)

@app.route('/api/echo', methods=['POST'])
def echo():
  data = request.json
  status = int(data.get('status', ''))

  if status == 4 and not(c.working):
    c.setStatus(status)
  elif status != c.status and status >= 0 and status < 4:
    GPIO.output(PORT, GPIO.LOW)
    c.setStatus(status)
    c.changeWorkStatus(True)
    if c.status != 3: GPIO.output(PORT[c.status], GPIO.HIGH)

  return jsonify({'status': c.status})

if __name__ == '__main__':
  try:
    app.run(host='0.0.0.0', port=5000)
  except KeyboardInterrupt:
    pass
  finally:
    GPIO.cleanup()