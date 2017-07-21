function addUsage(id){
    var index = 0;

    while (index < notes.length) {
        var nodeId = (notes[index].id == undefined) ? '' : (notes[index].id + '');
        if (nodeId == id) {
            break;
        }
        index++
    }

    if (notes[index].id != id) {
        termHook.echo("WARNING: addUsage did nothing, ID not found")
    }


    oldNotesLength = notes.length;
    oldHash = hash(JSON.stringify(notes));


    console.log(notes[index])
    if (typeof notes[index].usageCount === "undefined"){
        console.log("Undefined")
        notes[index].usageCount = 0
    }
    notes[index].usageCount++
    console.log(notes[index].usageCount)
    console.log(notes[index])

    saveCipher(oldNotesLength, termHook);
}

reUseTable = new Object()
function addToReuseTable(pwd){
    if (typeof reUseTable[pwd] === "undefined"){
        reUseTable[pwd] = 0;
    }
    reUseTable[pwd]++;
}