#!/usr/bin/python3
import time
import spidev
import math

CHN = 0
VOLTS = 5

class ADConverterClass:
    def __init__(self, ref_volts, ch):
        self.ref_volts = ref_volts
        self.spi = spidev.SpiDev()
        self.spi.open(0, 0)
        self.spi.max_speed_hz = 1000000
        self.ch = ch

    def get_voltage(self, ch):
        adc = self.spi.xfer2([1, (8 + ch) << 4, 0])
        raw = ((adc[1] & 3) << 8) + adc[2]
        volts = (raw * self.ref_volts) / 1023.0
        volts = round(volts, 4)
        return volts

    def get_dist(self):
        volts = self.get_voltage(self.ch)
        dist = 27.22 * (math.pow(volts, -1.2027))
        return dist

    def Cleanup(self):
        self.spi.close()


if __name__ == '__main__':
    ad_conv = ADConverterClass(ref_volts=VOLTS, ch=CHN)
    try:
        while True:
            __volts = ad_conv.get_voltage(ch=CHN)
            print("volts: {:8.2f}".format(__volts))
            __dist = ad_conv.get_dist()
            print("GP2Y0A02 distance[cm]: {:8.2f}".format(__dist))
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[Ctrl]+[C]")
    except Exception as e:
        print(str(e))
    finally:
        ad_conv.Cleanup()
        print("\nexit program")

