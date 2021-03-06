const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');


/**
* Muestra la ayuda.
*
* @param rl Objeto readline usado para implementar el CLI.
*/

exports.helpCmd = rl => {
	log("Commandos:");
	log("	h|help - Muestra esta ayuda.");
	log("	list - Listar los quizzes existentes.");
	log("	show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
	log("	add - Añadir un nuevo quiz interactivamente.");
	log("	delete <id> - Borrar el quiz indicado.");
	log("	edit <id> - Editar el quiz indicado.");
	log("	test <id> - Probar el quiz indicado.");
	log("	p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log("	credits - Créditos.");
	log("	q|quit - Salir del programa.");
	rl.prompt();
	};

/**
* Terminar el programa.
*
* @param er Objeto readline usado para implementar el CLI.
*/ 

exports.quitCmd = rl => {
	rl.close();
};

/**
* Añade un nuevo quiz al modelo.
* Pregunta interactivamente por la pregunta y por la respuesta.
*
* @param rl Objeto readline usado para implementar el CLI.
*/

exports.addCmd = rl => {
	
	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

		rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
			rl.prompt();
		});
	});
};

/**
* Lista todos los quizzes existentes en el modelo.
* 
* @param rl Objeto readline usado para implmentar el CLI.
*/

exports.listCmd = rl => {
	
	model.getAll().forEach((quiz, id) => {

		log(`  [${ colorize(id, 'magenta')}]: ${quiz.question}`);
	});

	rl.prompt();
};

/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
*
* @param rl Objeto readline usado para implmentar el CLI.
* @param id Clave del quiz a mostrar.
*/

exports.showCmd = (rl, id) => {
	
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			const quiz = model.getByIndex(id);
			log(`[${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		} catch(error){
			errorlog(error.message);
		}
	}

	rl.prompt();
};

/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clae del quiz a probar.
*/

exports.testCmd = (rl, id) => {
	
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try {

			const quiz = model.getByIndex(id);

			rl.question(`${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, answer => {
				let resp = answer.toLowerCase().trim();
				let respSist = quiz.answer.toLowerCase().trim();
				if (respSist === resp) {
					log(` Su respuesta es correcta. `);
					biglog('Correcta', 'green');
				} else {
					log(` Su respuesta es incorrecta. `);
					biglog('Incorrecta', 'red');
				}
					
				rl.prompt();
			});
		} catch (error) {
			errorlog(error.message);
			rl.prompt();
		}
	}

};

/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*
* @param rl Objeto readline usado para implementar el CLI.
*/

exports.playCmd = rl => {

	let score = 0;
	let toBeSolved = [];
	const longitud = model.count();
	
	
	// Meto en el array toBeSolved los ids de las preguntas
	for(var j=0; j<longitud; j++){
		toBeSolved.push(j);
	}

	const playOne = () => {

		if(toBeSolved.length === 0){
			log(colorize('No hay nada más que preguntar', 'red'));
			log(`Fin del examen. Aciertos:`);
			biglog(`${score}`, 'magenta');
			rl.prompt();
		} else {
			let id = toBeSolved[Math.floor(Math.random()*toBeSolved.length)];
			let quiz = model.getByIndex(id);
			rl.question(colorize(`${quiz.question}? `, 'red'), answer => {
				let resp = answer.toLowerCase().trim();
				let respSist = quiz.answer.toLowerCase().trim();
				
				if (respSist === resp) {
					score++;

					for(let i=0; i<toBeSolved.length; i++){
						if(toBeSolved[i]===id){
							toBeSolved.splice(i,1);
						}
					}
					log(` CORRECTO - Lleva ${score} aciertos.`);
					playOne();
				} else {
					log(` INCORRECTO. `);
					log(` Fin del examen. Aciertos: `);
					biglog(`${score}`, 'magenta');
					rl.prompt();
				}
			});		
		}
	};
playOne();
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readline usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/

exports.deleteCmd = (rl, id) => {


	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			model.deleteByIndex(id);
		} catch(error){
			errorlog(error.message);
		}
	}


	rl.prompt();
};

/**
* Edita un quiz del modelo.
*
* @param rl Objeto readline usado para implementar CLI.
* @param id Clave del quiz a editar en el modelo.
*/

exports.editCmd = (rl, id) => {

	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try {

			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
				
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

				rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
					
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch (error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
};

/**
* Muestra los nombres de los autores de la práctica.
* @param rl Objeto readline usado para implementar el CLI.
*/

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('BELEN');
    rl.prompt();
};