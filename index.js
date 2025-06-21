import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
const App = () => {
    const [allPlayersInput, setAllPlayersInput] = useState('');
    const [numTeamsInput, setNumTeamsInput] = useState('');
    const [playersPerTeamInput, setPlayersPerTeamInput] = useState('');
    const [leadersInput, setLeadersInput] = useState('');
    const [femalePlayersInput, setFemalePlayersInput] = useState('');
    const [liberosInput, setLiberosInput] = useState('');
    const [drawnTeamsOutput, setDrawnTeamsOutput] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                    .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
            });
        }
    }, []);
    const parsePlayerList = (inputString) => {
        return inputString.split(',')
            .map((name) => name.trim())
            .filter((name) => name !== '');
    };
    // Added a trailing comma inside <T,> to disambiguate from JSX tag
    const shuffleArray = (array) => {
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
        const allPlayersList = parsePlayerList(allPlayersInput);
        const leadersList = parsePlayerList(leadersInput);
        const femalePlayersList = parsePlayerList(femalePlayersInput);
        const liberosList = parsePlayerList(liberosInput);
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
        const allPlayersSet = new Set(allPlayersList);
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
        if (new Set(liberosList).size > numTeams) {
            setErrorMessage("Há mais líberos únicos do que o número de times, o que impede a regra de no máximo um líbero por time. Ajuste a lista de líberos ou o número de times.");
            return;
        }
        let availablePlayers = [...allPlayersList];
        const teams = Array.from({ length: numTeams }, () => []);
        const assignedPlayers = new Set();
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
        let availableFemales = shuffleArray(femalePlayersList.filter((f) => !assignedPlayers.has(f)));
        // Ensure each team gets one woman if possible
        for (let i = 0; i < numTeams; i++) {
            const teamHasFemale = teams[i].some(player => femalePlayersList.includes(player));
            if (!teamHasFemale && availableFemales.length > 0) {
                const femalePlayer = availableFemales.shift();
                if (femalePlayer && teams[i].length < playersPerTeam && !assignedPlayers.has(femalePlayer)) {
                    teams[i].push(femalePlayer);
                    assignedPlayers.add(femalePlayer);
                    availablePlayers = availablePlayers.filter(p => p !== femalePlayer);
                }
                else if (femalePlayer && assignedPlayers.has(femalePlayer) && !teams[i].includes(femalePlayer)) {
                    // If female already assigned (e.g as leader) but not in this team, she still counts.
                }
                else if (femalePlayer) {
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
                }
                else if (femalePlayer) {
                    availableFemales.unshift(femalePlayer);
                }
            }
        }
        // 3. Distribute Liberos (max 1 per team)
        let availableLiberos = shuffleArray(liberosList.filter((l) => !assignedPlayers.has(l)));
        for (let i = 0; i < numTeams; i++) {
            const teamHasLibero = teams[i].some(player => liberosList.includes(player));
            if (!teamHasLibero && teams[i].length < playersPerTeam && availableLiberos.length > 0) {
                const liberoPlayer = availableLiberos.shift();
                if (liberoPlayer && !assignedPlayers.has(liberoPlayer)) {
                    teams[i].push(liberoPlayer);
                    assignedPlayers.add(liberoPlayer);
                    availablePlayers = availablePlayers.filter(p => p !== liberoPlayer);
                }
                else if (liberoPlayer) {
                    availableLiberos.unshift(liberoPlayer); // Put back
                }
            }
        }
        // 4. Fill Remaining Spots
        let trulyAvailablePlayers = shuffleArray(allPlayersList.filter((p) => !assignedPlayers.has(p)));
        for (let i = 0; i < numTeams; i++) {
            while (teams[i].length < playersPerTeam && trulyAvailablePlayers.length > 0) {
                const player = trulyAvailablePlayers.shift();
                if (player && !assignedPlayers.has(player)) {
                    teams[i].push(player);
                    assignedPlayers.add(player);
                }
            }
        }
        const unassignedPlayers = allPlayersList.filter((p) => !assignedPlayers.has(p));
        if (unassignedPlayers.length > 0) {
            let partialFillMessage = "Alguns jogadores não puderam ser atribuídos. ";
            teams.forEach((team, index) => {
                if (team.length < playersPerTeam) {
                    partialFillMessage += `Time ${index + 1} não está completo. `;
                }
            });
            setErrorMessage(prev => prev ? prev + " " + partialFillMessage : partialFillMessage);
        }
        setDrawnTeamsOutput(teams.map((team, index) => `Time ${index + 1}: ${team.join(', ')}`));
    };
    return (React.createElement("div", { className: "app-container" },
        React.createElement("header", { className: "header" },
            React.createElement("img", { src: "./areia-31-logo.png", alt: "Areia31 Logo", className: "logo" }),
            React.createElement("h1", { className: "app-title" }, "Areia31 - Simulador de Times")),
        React.createElement("div", { className: "main-content" },
            React.createElement("section", { className: "input-section" },
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "allPlayers" }, "Nome de Todos os Jogadores (separados por v\u00EDrgula):"),
                    React.createElement("textarea", { id: "allPlayers", value: allPlayersInput, onChange: (e) => setAllPlayersInput(e.target.value), placeholder: "Ex: Ana, Bruno, Carla, Daniel" })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "numTeams" }, "N\u00FAmero de Times:"),
                    React.createElement("input", { type: "number", id: "numTeams", value: numTeamsInput, onChange: (e) => setNumTeamsInput(e.target.value), min: "1", placeholder: "Ex: 2" })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "playersPerTeam" }, "Jogadores por Time:"),
                    React.createElement("input", { type: "number", id: "playersPerTeam", value: playersPerTeamInput, onChange: (e) => setPlayersPerTeamInput(e.target.value), min: "1", placeholder: "Ex: 2" })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "leaders" }, "L\u00EDderes de Cada Time (separados por v\u00EDrgula):"),
                    React.createElement("textarea", { id: "leaders", value: leadersInput, onChange: (e) => setLeadersInput(e.target.value), placeholder: "Ex: Bruno, Daniel (opcional)" })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "femalePlayers" }, "Jogadoras (Mulheres) (separadas por v\u00EDrgula):"),
                    React.createElement("textarea", { id: "femalePlayers", value: femalePlayersInput, onChange: (e) => setFemalePlayersInput(e.target.value), placeholder: "Ex: Ana, Carla (opcional)" })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "liberos" }, "L\u00EDberos (separados por v\u00EDrgula):"),
                    React.createElement("textarea", { id: "liberos", value: liberosInput, onChange: (e) => setLiberosInput(e.target.value), placeholder: "Ex: Eduardo (opcional)" })),
                React.createElement("button", { onClick: handleDrawTeams, className: "draw-button", "aria-label": "Sortear Times" }, "Sortear Times")),
            React.createElement("section", { className: "output-section" },
                React.createElement("h2", null, "Times Sorteados:"),
                errorMessage && React.createElement("p", { className: "error-message", role: "alert" }, errorMessage),
                drawnTeamsOutput.length > 0 && (React.createElement("ul", { className: "teams-list" }, drawnTeamsOutput.map((team, index) => (React.createElement("li", { key: index, className: "team-item" },
                    team.split(': ')[0],
                    ": ",
                    React.createElement("strong", null, team.split(': ')[1])))))),
                drawnTeamsOutput.length === 0 && !errorMessage && (React.createElement("p", null, "Preencha os campos e clique em \"Sortear Times\" para ver os resultados."))))));
};
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(React.createElement(React.StrictMode, null,
        React.createElement(App, null)));
}
else {
    console.error("Elemento raiz 'root' não encontrado no DOM.");
}
