const fs = require('fs');
const { GifUtil } = require('gifwrap');

async function check() {
    const thinking = await GifUtil.read('../src/assets/thinking.gif');
    console.log('thinking.gif:', thinking.width, 'x', thinking.height);
    const success = await GifUtil.read('../src/assets/success.gif');
    console.log('success.gif:', success.width, 'x', success.height);
    const error = await GifUtil.read('../src/assets/error.gif');
    console.log('error.gif:', error.width, 'x', error.height);
}

check();
