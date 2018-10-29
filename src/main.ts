(async () => {
    const { add_one } = await import('rust-lib');

    console.time('rust');
    console.log(add_one(1));
    console.timeEnd('rust');
})();
