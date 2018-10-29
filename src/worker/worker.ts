const ctx: Worker = self as any;

ctx.addEventListener("message", function messageListener(event: any): void {
    console.log('from main thread: ', event.data);
});

ctx.postMessage({ foo: "foo" });

(async () => {
    ctx.postMessage({ foo: "bar" });
})();