const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  let final = ''
  readline.question(``, (name) => {
    final += name;
    readline.close()
  })

  console.log(final)