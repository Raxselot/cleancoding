import fs from 'fs';
import { Choice, ChoiceLoader, Game } from './rock_paper_scissors_spock.js';

// Manuelles Mocking von fs.readFileSync
const originalReadFileSync = fs.readFileSync;

beforeEach(() => {
    fs.readFileSync = (path, encoding) => {
        return JSON.stringify({
            choices: [
                { name: 'rock', winsAgainst: ['scissors', 'lizard'] },
                { name: 'paper', winsAgainst: ['rock', 'spock'] },
                { name: 'scissors', winsAgainst: ['paper', 'lizard'] },
                { name: 'spock', winsAgainst: ['scissors', 'rock'] },
                { name: 'lizard', winsAgainst: ['spock', 'paper'] }
            ]
        });
    };
});

afterEach(() => {
    fs.readFileSync = originalReadFileSync;
});

describe('Choice Class', () => {
    it('should correctly add winning choices and check if it can beat another choice', () => {
        const rock = new Choice('rock');
        const lizard = new Choice('lizard');

        rock.addWinningChoice(lizard);
        
        expect(rock.canBeat(lizard)).toBe(true);
        expect(lizard.canBeat(rock)).toBe(false);
    });
});

describe('ChoiceLoader Class', () => {
    it('should load choices correctly from a config file', () => {
        const choices = ChoiceLoader.readChoices('choice.json');
        expect(choices.length).toBe(5);

        const rock = choices.find(choice => choice.name === 'rock');
        const lizard = choices.find(choice => choice.name === 'lizard');

        expect(rock.canBeat(lizard)).toBe(true);
        expect(lizard.canBeat(rock)).toBe(false);
    });
});

describe('Game Class', () => {
    let game;

    beforeEach(() => {
        const choices = ChoiceLoader.readChoices('choice.json');
        game = new Game(choices);
    });

    it('should correctly determine a tie', () => {
        const rock = game.choices.find(choice => choice.name === 'rock');
        expect(game.decideWinner(rock, rock)).toBe('It\'s a tie!');
    });

    it('should correctly determine a player win', () => {
        const rock = game.choices.find(choice => choice.name === 'rock');
        const scissors = game.choices.find(choice => choice.name === 'scissors');

        expect(game.decideWinner(rock, scissors)).toBe('You win!');
    });

    it('should correctly determine a player loss', () => {
        const rock = game.choices.find(choice => choice.name === 'rock');
        const paper = game.choices.find(choice => choice.name === 'paper');

        expect(game.decideWinner(rock, paper)).toBe('You lose!');
    });

    it('should correctly handle Spock vs Scissors', () => {
        const spock = game.choices.find(choice => choice.name === 'spock');
        const scissors = game.choices.find(choice => choice.name === 'scissors');

        expect(game.decideWinner(spock, scissors)).toBe('You win!');
    });

    it('should correctly handle Lizard vs Spock', () => {
        const lizard = game.choices.find(choice => choice.name === 'lizard');
        const spock = game.choices.find(choice => choice.name === 'spock');

        expect(game.decideWinner(lizard, spock)).toBe('You win!');
    });

    it('should correctly handle invalid user input', (done) => {
        const invalidChoice = game.playerInput('invalid');
        expect(invalidChoice).toBeUndefined();
        done();
    });    
});
