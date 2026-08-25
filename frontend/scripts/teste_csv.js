const readline = require("readline");
const fs = require("fs");

const line = readline.createInterface({
    input: fs.createReadStream("arquivo.csv"),
});

line.on("line", (data) => {
    let csv = data.split(";");

    console.log(`Nome: ${csv[0]} - Valor: ${csv[1]}`);
})