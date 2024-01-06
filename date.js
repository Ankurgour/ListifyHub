exports.getDate = function(){
    const date  = new Date();
    let options = {
        weekday : "long",
        day : "numeric",
        month : "long",
    }
    return date.toLocaleDateString("en-US",options);
}