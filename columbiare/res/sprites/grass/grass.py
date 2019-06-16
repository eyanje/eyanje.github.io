import random

width = 16
height = 16
channels = 4

image = list()

with open('grass2.data', 'rb') as data:
    for i,byte in enumerate(data.read()):
        if (i % (width * channels) == 0):
            # Add a new row
            image.append(list())
        if (i % channels == 0):
            image[-1].append(list())
            # Add a new col when i % width == 0

        image[-1][-1].append(255 - int(byte))

print(image)

new_image = list()

for i,row in enumerate(image):
    new_image.append(list())
    for j,col in enumerate(row):
        new_image[-1].append(list())
        for k,val in enumerate(col):
            new_image[-1][-1].append(0)

for i,row in enumerate(image):
    for j,col in enumerate(row):
        if col[-1] < 255:
            rand = random.random()
            new_col = j
            if rand < 1/3:
                new_col = j + 1
                # Shift grass if necessary

            new_col %= width

            for k,val in enumerate(col):
                new_image[i][new_col][k] += val
                if new_image[i][new_col][k] > 255:
                    new_image[i][new_col][k] = 255

assert(image != new_image)

with open('newgrass.data', 'wb') as new_grass:
    for row in new_image:
        for col in row:
            for i,val in enumerate(col):
                col[i] = 255 - val
            new_grass.write(bytes(col))
