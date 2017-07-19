module.exports = {
    // Just like _.each except takes a skip which determines how many items to skip in the array
    forEachSkip: function (arr, cb, skip, start) {
        for (var i = start || 0; i < arr.length; i+=skip){
            cb(arr[i],i,arr)
        }
    },
    // Takes a string of what you are logging than the value (as many as you like)
    log: function () {
        var argsArr = Array.from(arguments);
        this.forEachSkip(argsArr, (value, index) => {
            console.log(value, argsArr[index+1]);
        }, 2);
    }
}