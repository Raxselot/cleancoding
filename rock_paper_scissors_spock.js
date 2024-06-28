const readline = require('readline');
const fs = require('fs');

class Choice {
    constructor(name) {
        this.name = name;
        this.wins = new Set();
    }

    addWinningChoice(choice) {
        this.wins.add(choice.name);
    }

    canBeat(choice) {
        return this.wins.has(choice.name);
    }
}

class ChoiceLoader {
    static readChoices(configFile) {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        const choicesMap = new Map();

        configData.choices.forEach(choiceConfig => {
            const choice = new Choice(choiceConfig.name);
            choicesMap.set(choiceConfig.name, choice);
        });

        configData.choices.forEach(choiceConfig => {
            const choice = choicesMap.get(choiceConfig.name);
            choiceConfig.winsAgainst.forEach(winChoiceName => {
                const winChoice = choicesMap.get(winChoiceName);
                choice.addWinningChoice(winChoice);
            });
        });

        return Array.from(choicesMap.values());
    }
}

class Game {
    constructor(choices) {
        this.choices = choices;
    }

    calculateComputerChoice() {
        const randomIndex = Math.floor(Math.random() * this.choices.length);
        return this.choices[randomIndex];
    }

    decideWinner(playerChoice, computerChoice) {
        if (playerChoice.name === computerChoice.name) {
            return 'It\'s a tie!';
        }

        if (playerChoice.canBeat(computerChoice)) {
            return 'You win!';
        }

        return 'You lose!';
    }

    playerInput(input) {
        const playerChoiceName = input.toLowerCase();
        return this.choices.find(choice => choice.name.toLowerCase() === playerChoiceName);
    }

    play() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.create_choices_question(rl);
    }

    create_choices_question(rl) {
        const choiceNames = this.choices.map(choice => choice.name).join(', ');
        rl.question(`Enter your choice (${choiceNames}): `, (input) => {
            this.compare_userinput(rl, input);
        });
    }

    compare_userinput(rl, input) {
        const playerChoice = this.playerInput(input);

        if (!playerChoice) {
            this.Invalid_Choice_errorhandling(rl);
            return;
        }

        const computerChoice = this.calculateComputerChoice();
        console.log(`Computer chose ${computerChoice.name}`);

        const result = this.decideWinner(playerChoice, computerChoice);
        console.log(result);

        rl.close();
    }

    Invalid_Choice_errorhandling(rl) {
        const choiceNames = this.choices.map(choice => choice.name).join(', ');
        console.log(`Invalid choice, please enter one of the following: ${choiceNames}.`);
        rl.close();
    }
}

const choices = ChoiceLoader.readChoices('choice.json');
const game = new Game(choices);
game.play();
