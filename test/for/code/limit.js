var a= 1;
while(a--) {
    for (; p < 2; p++) {
        try {
            var arr = [1, 2, 3];
            if (p === 1) {
                global.__res += 10;
            } else {
                for (var k of arr) {
                    global.__res += k;
                }
            }
            for (var ppp = 0; ppp < 2;) {
                throw 'error';
            }
        } catch (e) {
            global.__res += 100;
        }

        global.__res = global.__res === 216 ? 216 : global.__res === 21 ? 21 : global.__res;
    }
}