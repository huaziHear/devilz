if (p===2) {
    for(var i=0; i<2; i++) {
        p = 3;
        if (p === 3) {
            p=1;
            while(p--) {
                function abc (params) {
                    return 1;
                }
                abc() && (global.__res = 36);
            }
        } else {
            global.__res = 110;
        }
        i=100;
    }
} else {
    global.__res = 110;
}