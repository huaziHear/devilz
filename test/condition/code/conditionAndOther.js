try {
    if (p === 1) {
        while(p--) {
            global.__res = p == 1 ? 1 : 2;
        }
    } else {
        for(var a=0; a<10;a++) {
            console.log(a);
        }
    }
} catch(e) {
    global.__res = 3;
}