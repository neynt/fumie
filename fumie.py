import hashlib
import sys
import os
import functools
import shutil

BLOCK_SIZE = 128 * 1024

# base62, basically
parts = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

N_PARTS = 16

def main(filename, fileext, dropdir):
    sha = hashlib.sha256()
    with open(filename, 'rb') as f:
        for data in iter(lambda: f.read(BLOCK_SIZE), b''):
            sha.update(data)
    num = int.from_bytes(sha.digest(), byteorder='big')
    name_parts = []
    for _ in range(N_PARTS):
        name_parts.append(parts[num % len(parts)])
        num //= len(parts)
    base_name = ''.join(name_parts)
    shutil.move(filepath, os.path.join(dropdir, base_name))
    print(base_name + fileext)

if __name__ == '__main__':
    filepath = sys.argv[1]
    fileext = sys.argv[2]
    dropdir = sys.argv[3]
    main(filepath, fileext, dropdir)
