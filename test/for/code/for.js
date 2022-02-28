for(var a = 0;a<10;a++) {
    global.__res += a;
}
var b =0;
for(;b<10;b++) {
    global.__res += b;
}
var c = 0;
for(;c<10;) {
    global.__res += c;
    c++;
}