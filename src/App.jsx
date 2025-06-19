import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Users, UserPlus, Shuffle, Shield } from 'lucide-react'
import logoImage from './assets/logo.jpg'
import './App.css'

function App() {
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [numTeams, setNumTeams] = useState(2)
  const [playersPerTeam, setPlayersPerTeam] = useState(5)
  const [sortedTeams, setSortedTeams] = useState([])

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now(),
        name: newPlayerName.trim(),
        isLeader: false,
        isFemale: false,
        isLibero: false
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName('')
    }
  }

  const removePlayer = (id) => {
    setPlayers(players.filter(player => player.id !== id))
  }

  const toggleLeader = (id) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, isLeader: !player.isLeader } : player
    ))
  }

  const toggleFemale = (id) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, isFemale: !player.isFemale } : player
    ))
  }

  const toggleLibero = (id) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, isLibero: !player.isLibero } : player
    ))
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const sortTeams = () => {
    if (players.length === 0) {
      alert('Adicione pelo menos um jogador!')
      return
    }

    const leaders = players.filter(p => p.isLeader)
    const liberos = players.filter(p => p.isLibero)
    const females = players.filter(p => p.isFemale)
    const regularPlayers = players.filter(p => !p.isLeader && !p.isFemale && !p.isLibero)
    const femaleNonLeaders = players.filter(p => p.isFemale && !p.isLeader && !p.isLibero)

    if (leaders.length > numTeams) {
      alert(`Você tem ${leaders.length} líderes, mas apenas ${numTeams} times. Reduza o número de líderes.`)
      return
    }

    if (liberos.length > numTeams) {
      alert(`Você tem ${liberos.length} líberos, mas apenas ${numTeams} times. Reduza o número de líberos.`)
      return
    }

    const teams = []
    
    // Criar times vazios
    for (let i = 0; i < numTeams; i++) {
      teams.push({
        id: i + 1,
        leader: null,
        members: []
      })
    }

    // Distribuir líderes aleatoriamente
    const shuffledLeaders = shuffleArray(leaders)
    shuffledLeaders.forEach((leader, index) => {
      teams[index].leader = leader
      teams[index].members.push(leader)
    })

    // Distribuir líberos (um por time, se houver)
    const shuffledLiberos = shuffleArray(liberos)
    shuffledLiberos.forEach((libero, index) => {
      const teamIndex = index % numTeams
      teams[teamIndex].members.push(libero)
    })

    // Distribuir mulheres (que não são líderes nem líberos) entre os times
    const shuffledFemales = shuffleArray(femaleNonLeaders)
    shuffledFemales.forEach((female, index) => {
      const teamIndex = index % numTeams
      teams[teamIndex].members.push(female)
    })

    // Distribuir jogadores restantes
    const shuffledRegular = shuffleArray(regularPlayers)
    shuffledRegular.forEach((player, index) => {
      const teamIndex = index % numTeams
      teams[teamIndex].members.push(player)
    })

    setSortedTeams(teams)
  }

  const formatTeamResult = (team) => {
    const memberNames = team.members.map(member => member.name).join('; ')
    return `Time ${team.id}: ${memberNames}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho com Logo */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={logoImage} 
              alt="Logo Areia 31" 
              className="w-20 h-20 rounded-lg shadow-lg"
            />
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="text-white" />
              Simulador de Times
            </h1>
          </div>
          <p className="text-orange-100">Organize seus jogadores em times de forma justa e aleatória</p>
        </div>

        {/* Seção de Entrada de Jogadores */}
        <Card className="bg-purple-900 border-purple-700 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-100">
              <UserPlus className="text-orange-300" />
              Adicionar Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nome do jogador"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                className="flex-1 bg-purple-800 border-purple-600 text-white placeholder-purple-300"
              />
              <Button onClick={addPlayer} className="bg-orange-600 hover:bg-orange-700 text-white">
                Adicionar
              </Button>
            </div>
            
            {players.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-100">Jogadores Adicionados ({players.length}):</h3>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-purple-800 rounded-lg border border-purple-600">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">{player.name}</span>
                        <div className="flex gap-2">
                          {player.isLeader && <Badge variant="secondary" className="bg-yellow-500 text-yellow-900">Líder</Badge>}
                          {player.isFemale && <Badge variant="secondary" className="bg-pink-500 text-pink-900">Mulher</Badge>}
                          {player.isLibero && <Badge variant="secondary" className="bg-blue-500 text-blue-900">Líbero</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`leader-${player.id}`}
                            checked={player.isLeader}
                            onCheckedChange={() => toggleLeader(player.id)}
                            className="border-orange-300"
                          />
                          <label htmlFor={`leader-${player.id}`} className="text-sm text-orange-100">Líder</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`female-${player.id}`}
                            checked={player.isFemale}
                            onCheckedChange={() => toggleFemale(player.id)}
                            className="border-orange-300"
                          />
                          <label htmlFor={`female-${player.id}`} className="text-sm text-orange-100">Mulher</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`libero-${player.id}`}
                            checked={player.isLibero}
                            onCheckedChange={() => toggleLibero(player.id)}
                            className="border-orange-300"
                          />
                          <label htmlFor={`libero-${player.id}`} className="text-sm text-orange-100">Líbero</label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Configuração de Times */}
        <Card className="bg-purple-900 border-purple-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-orange-100">Configuração dos Times</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-orange-100">Quantidade de Times</label>
              <Input
                type="number"
                min="2"
                value={numTeams}
                onChange={(e) => setNumTeams(parseInt(e.target.value) || 2)}
                className="bg-purple-800 border-purple-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-orange-100">Jogadores por Time (aproximado)</label>
              <Input
                type="number"
                min="1"
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 1)}
                className="bg-purple-800 border-purple-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Sorteio */}
        <div className="text-center">
          <Button
            onClick={sortTeams}
            size="lg"
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 text-lg shadow-xl"
            disabled={players.length === 0}
          >
            <Shuffle className="mr-2 h-5 w-5" />
            Sortear Times
          </Button>
        </div>

        {/* Seção de Resultados */}
        {sortedTeams.length > 0 && (
          <Card className="bg-purple-900 border-purple-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-orange-300">Resultado do Sorteio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTeams.map(team => (
                  <div key={team.id} className="p-4 bg-orange-100 rounded-lg border-l-4 border-orange-500">
                    <h3 className="font-bold text-lg text-orange-800 mb-2">Time {team.id}</h3>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, index) => (
                        <Badge
                          key={member.id}
                          variant={member.isLeader ? "default" : "secondary"}
                          className={`${
                            member.isLeader ? 'bg-yellow-500 text-yellow-900' : 
                            member.isLibero ? 'bg-blue-500 text-blue-900' :
                            'bg-gray-200 text-gray-800'
                          } ${member.isFemale ? 'border-pink-300' : ''}`}
                        >
                          {member.name}
                          {member.isLeader && ' (Líder)'}
                          {member.isLibero && ' (Líbero)'}
                          {member.isFemale && ' ♀'}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {formatTeamResult(team)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App

