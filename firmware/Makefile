# Makefile for JieLi AC791N / M-VAVE FM-1 (FuMi-1) Custom Firmware
# Target: AC791N (Pi32v2 DSP core)

CC = pi32v2-elf-gcc
OBJCOPY = pi32v2-elf-objcopy
ISD_DOWNLOAD = isd_download

CFLAGS = -O2 -Wall -mllvm -pi32v2-large-program=true -fno-common -ffunction-sections -fdata-sections
INCLUDES = -I. -I./include
LDFLAGS = -Wl,--gc-sections -T ac791n.ld

SRCS = karplus_strong_javari.c indian_accompaniment.c main.c
OBJS = $(SRCS:.c=.o)
TARGET = fumi_tanpura_ac791n

all: $(TARGET).bin $(TARGET).ufw

$(TARGET).elf: $(OBJS)
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $(OBJS) -lm

$(TARGET).bin: $(TARGET).elf
	$(OBJCOPY) -O binary $< $@

$(TARGET).ufw: $(TARGET).bin
	@echo "Packaging JieLi Upgrade Firmware File (UFW)..."
	python3 pack_ufw.py --bin $(TARGET).bin --out $@

clean:
	rm -f *.o *.elf *.bin *.ufw
