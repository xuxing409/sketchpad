export const diff = (a:any, b: any) => {
    let result = false;
    try{
        const aa = JSON.stringify(a);
        const bb = JSON.stringify(b);
        result = aa !== bb;
    }catch(err) {
        console.log(err)
    }
    return result
}