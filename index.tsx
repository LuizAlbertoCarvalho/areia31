
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
    const [allPlayersInput, setAllPlayersInput] = useState('');
    const [numTeamsInput, setNumTeamsInput] = useState('');
    const [playersPerTeamInput, setPlayersPerTeamInput] = useState('');
    const [leadersInput, setLeadersInput] = useState('');
    const [femalePlayersInput, setFemalePlayersInput] = useState('');
    const [liberosInput, setLiberosInput] = useState('');

    const [drawnTeamsOutput, setDrawnTeamsOutput] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const parsePlayerList = (inputString: string): string[] => {
        return inputString.split(',')
            .map((name: string) => name.trim())
            .filter((name: string) => name !== '');
    };

    // Added a trailing comma inside <T,> to disambiguate from JSX tag
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleDrawTeams = () => {
        setErrorMessage('');
        setDrawnTeamsOutput([]);

        const allPlayersList: string[] = parsePlayerList(allPlayersInput);
        const leadersList: string[] = parsePlayerList(leadersInput);
        const femalePlayersList: string[] = parsePlayerList(femalePlayersInput);
        const liberosList: string[] = parsePlayerList(liberosInput);

        const numTeams = parseInt(numTeamsInput, 10);
        const playersPerTeam = parseInt(playersPerTeamInput, 10);

        // Validations
        if (allPlayersList.length === 0) {
            setErrorMessage("Por favor, insira os nomes de todos os jogadores.");
            return;
        }
        if (isNaN(numTeams) || numTeams <= 0) {
            setErrorMessage("Por favor, insira um número válido de times.");
            return;
        }
        if (isNaN(playersPerTeam) || playersPerTeam <= 0) {
            setErrorMessage("Por favor, insira um número válido de jogadores por time.");
            return;
        }
        if (allPlayersList.length < numTeams * playersPerTeam) {
            setErrorMessage("Não há jogadores suficientes para formar os times com o número de jogadores especificado.");
            return;
        }

        const allPlayersSet = new Set<string>(allPlayersList);
        for (const leader of leadersList) {
            if (!allPlayersSet.has(leader)) {
                setErrorMessage(`Líder '${leader}' não está na lista de todos os jogadores.`);
                return;
            }
        }
        for (const female of femalePlayersList) {
            if (!allPlayersSet.has(female)) {
                setErrorMessage(`Jogadora '${female}' não está na lista de todos os jogadores.`);
                return;
            }
        }
        for (const libero of liberosList) {
            if (!allPlayersSet.has(libero)) {
                setErrorMessage(`Líbero '${libero}' não está na lista de todos os jogadores.`);
                return;
            }
        }

        if (leadersList.length > numTeams) {
            setErrorMessage("Há mais líderes do que o número de times. Ajuste a lista de líderes ou o número de times.");
            return;
        }
         if (new Set<string>(liberosList).size > numTeams) {
            setErrorMessage("Há mais líberos únicos do que o número de times, o que impede a regra de no máximo um líbero por time. Ajuste a lista de líberos ou o número de times.");
            return;
        }

        let availablePlayers: string[] = [...allPlayersList];
        const teams: string[][] = Array.from({ length: numTeams }, () => []);
        const assignedPlayers = new Set<string>();

        // 1. Assign Leaders
        const shuffledLeaders = shuffleArray(leadersList);
        for (let i = 0; i < numTeams && i < shuffledLeaders.length; i++) {
            const leader = shuffledLeaders[i];
            if (!assignedPlayers.has(leader)) {
                teams[i].push(leader);
                assignedPlayers.add(leader);
                availablePlayers = availablePlayers.filter(p => p !== leader);
            }
        }
        
        // 2. Distribute Female Players
        let availableFemales = shuffleArray(femalePlayersList.filter((f: string) => !assignedPlayers.has(f)));
        // Ensure each team gets one woman if possible
        for (let i = 0; i < numTeams; i++) {
            const teamHasFemale = teams[i].some(player => femalePlayersList.includes(player));
            if (!teamHasFemale && availableFemales.length > 0) {
                const femalePlayer = availableFemales.shift();
                if (femalePlayer && teams[i].length < playersPerTeam && !assignedPlayers.has(femalePlayer)) {
                    teams[i].push(femalePlayer);
                    assignedPlayers.add(femalePlayer);
                    availablePlayers = availablePlayers.filter(p => p !== femalePlayer);
                } else if (femalePlayer && assignedPlayers.has(femalePlayer) && !teams[i].includes(femalePlayer)) {
                     // If female already assigned (e.g as leader) but not in this team, she still counts.
                } else if (femalePlayer) {
                    availableFemales.unshift(femalePlayer); // Put back if team is full or player already in team
                }
            }
        }
         // Distribute remaining females if teams still need them and capacity allows
        for (let i = 0; i < numTeams && availableFemales.length > 0; i++) {
            if (teams[i].length < playersPerTeam) {
                 const femalePlayer = availableFemales.shift();
                 if (femalePlayer && !assignedPlayers.has(femalePlayer)) {
                    teams[i].push(femalePlayer);
                    assignedPlayers.add(femalePlayer);
                    availablePlayers = availablePlayers.filter(p => p !== femalePlayer);
                 } else if (femalePlayer) {
                     availableFemales.unshift(femalePlayer);
                 }
            }
        }

        // 3. Distribute Liberos (max 1 per team)
        let availableLiberos = shuffleArray(liberosList.filter((l: string) => !assignedPlayers.has(l)));
        for (let i = 0; i < numTeams; i++) {
            const teamHasLibero = teams[i].some(player => liberosList.includes(player));
            if (!teamHasLibero && teams[i].length < playersPerTeam && availableLiberos.length > 0) {
                const liberoPlayer = availableLiberos.shift();
                 if (liberoPlayer && !assignedPlayers.has(liberoPlayer)) {
                    teams[i].push(liberoPlayer);
                    assignedPlayers.add(liberoPlayer);
                    availablePlayers = availablePlayers.filter(p => p !== liberoPlayer);
                } else if (liberoPlayer) {
                    availableLiberos.unshift(liberoPlayer); // Put back
                }
            }
        }

        // 4. Fill Remaining Spots
        let trulyAvailablePlayers = shuffleArray(allPlayersList.filter((p: string) => !assignedPlayers.has(p)));
        for (let i = 0; i < numTeams; i++) {
            while (teams[i].length < playersPerTeam && trulyAvailablePlayers.length > 0) {
                const player = trulyAvailablePlayers.shift();
                if (player && !assignedPlayers.has(player)) { 
                    teams[i].push(player);
                    assignedPlayers.add(player); 
                }
            }
        }
        
        const unassignedPlayers = allPlayersList.filter((p: string) => !assignedPlayers.has(p));
        if (unassignedPlayers.length > 0) {
             let partialFillMessage = "Alguns jogadores não puderam ser atribuídos. ";
             teams.forEach((team, index) => {
                 if (team.length < playersPerTeam) {
                     partialFillMessage += `Time ${index + 1} não está completo. `;
                 }
             });
             setErrorMessage(prev => prev ? prev + " " + partialFillMessage : partialFillMessage);
        }

        setDrawnTeamsOutput(
            teams.map((team, index) => `Time ${index + 1}: ${team.join(', ')}`)
        );
    };

    return (
        <div className="app-container">
            <header className="header">
                <img src="./areia-31-logo.png" alt="Areia31 Logo" className="logo" />
                <h1 className="app-title">Areia31 - Simulador de Times</h1>
            </header>
            
            <div className="main-content">
                <section className="input-section">
                    <div className="form-group">
                        <label htmlFor="allPlayers">Nome de Todos os Jogadores (separados por vírgula):</label>
                        <textarea
                            id="allPlayers"
                            value={allPlayersInput}
                            onChange={(e) => setAllPlayersInput(e.target.value)}
                            placeholder="Ex: Ana, Bruno, Carla, Daniel"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="numTeams">Número de Times:</label>
                        <input
                            type="number"
                            id="numTeams"
                            value={numTeamsInput}
                            onChange={(e) => setNumTeamsInput(e.target.value)}
                            min="1"
                            placeholder="Ex: 2"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="playersPerTeam">Jogadores por Time:</label>
                        <input
                            type="number"
                            id="playersPerTeam"
                            value={playersPerTeamInput}
                            onChange={(e) => setPlayersPerTeamInput(e.target.value)}
                            min="1"
                            placeholder="Ex: 2"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="leaders">Líderes de Cada Time (separados por vírgula):</label>
                        <textarea
                            id="leaders"
                            value={leadersInput}
                            onChange={(e) => setLeadersInput(e.target.value)}
                            placeholder="Ex: Bruno, Daniel (opcional)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="femalePlayers">Jogadoras (Mulheres) (separadas por vírgula):</label>
                        <textarea
                            id="femalePlayers"
                            value={femalePlayersInput}
                            onChange={(e) => setFemalePlayersInput(e.target.value)}
                            placeholder="Ex: Ana, Carla (opcional)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="liberos">Líberos (separados por vírgula):</label>
                        <textarea
                            id="liberos"
                            value={liberosInput}
                            onChange={(e) => setLiberosInput(e.target.value)}
                            placeholder="Ex: Eduardo (opcional)"
                        />
                    </div>

                    <button onClick={handleDrawTeams} className="draw-button" aria-label="Sortear Times">
                        Sortear Times
                    </button>
                </section>

                <section className="output-section">
                    <h2>Times Sorteados:</h2>
                    {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
                    {drawnTeamsOutput.length > 0 && (
                        <ul className="teams-list">
                            {drawnTeamsOutput.map((team: string, index: number) => (
                                <li key={index} className="team-item">
                                    {team.split(': ')[0]}: <strong>{team.split(': ')[1]}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                    {drawnTeamsOutput.length === 0 && !errorMessage && (
                        <p>Preencha os campos e clique em "Sortear Times" para ver os resultados.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
} else {
    console.error("Elemento raiz 'root' não encontrado no DOM.");
}
