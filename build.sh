#!/usr/bin/env bash

yarn build
ssh nhz.jeffthecoder.xyz sudo chown -Rv guochao:guochao /var/www/tools.jeffthecoder.xyz/
rsync -avzrp ./build/ nhz.jeffthecoder.xyz:/var/www/tools.jeffthecoder.xyz/
ssh nhz.jeffthecoder.xyz sudo chown -Rv nobody:nobody /var/www/tools.jeffthecoder.xyz/
ssh nhz.jeffthecoder.xyz sudo systemctl restart openresty