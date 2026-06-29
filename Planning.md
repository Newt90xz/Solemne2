# Work Planning

## Semana 1, 27 de abril - 1 de mayo:

- [x] Videogame genre definition
- [x] Define technologies to use.
- [x] Develop mockup.

## Semana 2, 4 de mayo - 8 de mayo:

- [x] Base Game Development
  - [x] File Structure
  - [x] Pause/Exit
  - [x] Map
    - [x] Loop
  - [x] Building Implementation
    - [x] Capture Buildings
    - [x] Buffs
- [x] Desarrollo de paginas principales del juego.
  - [x] Main Menu
  - [x] Options
  - [x] UI
  - [x] Manual
- [x] Player Development
  - [x] Moovement
  - [x] Cursor Fire
  - [x] Exp System Structure
  - [x] Animations
- [x] Definir propiedades de las armas y objetos.
  - [x] Weapon Design
  - [x] Weapon Properties
- [x] Principal - [X] Piercing - [X] Shotgun - [X] Orbital - [X] Explosives
- [x] Player Hud
  - [x] Player State
    - [x] Life
    - [x] Exp/Level
  - [x] Weapon Icons - [X] Main - [X] Piercing - [X] Shotgun - [X] Orbital - [X] Explosives
- [x] Movement and control tests.

## Semana 3, 11 de mayo - 15 de mayo:

- [x] Enemy Development/System.
  - [x] Spawn
    - [x] Spawning fuction.
    - [x] Off-screen spawn.
    - [x] Randomizing.
  - [x] Tracking Player.
  - [x] Enemy health and damage.
  - [x] Enemie Design.
    - [x] Neutral.
    - [x] Shooters
    - [x] Runners/Dashers (Stops then goes fast, could go over buildings)
    - [x] Big Tank

- [x] Combat System.
  - [x] Hitboxes.
    - [x] Player hitbox.
    - [x] Enemy hitbox.
  - [x] Collitions.
    - [x] Bullet collition.
    - [x] Obstacles.
      - [x] Random obstacle generation
      - [x] Physical wall
      - [x] Destroyed buildings

- [x] Upgrade zones (aka Buildings).
  - [x] Upgrades
    - [x] Akimbo
    - [x] Dash
    - [x] Health up
  - [x] Icon
    - [x] Akimbo
    - [x] Dash
    - [x] Health up

- [x] Tweaks
  - [x] Weapon balance adjustments
  - [x] Score and Score Board (Score = Damage delt throughout)
  - [x] Building Randomizer
  - [x] defined color palettes
  - [x] Add game over screen

- [x] Movement and function tests
  - [x] BugDash
  - [x] Building capture buff

## Semana 4, 25 de mayo - 28 de mayo

- [x] Music and Sound Effects
  - [x] Main music
- [x] Bosses
  - [x] Spawn Condition (Very important)
  - [x] Boss hitbox
  - [x] Creates obstacules in front of player
    - [x] McAffe
      - [x] Tornado attacks
      - [x] Expansive Bullets
    - [x] Norton
      - [x] Lighting Shotgun Attack
      - [x] Dissapear then reappears elsewhere
      - [x] Difficult to hit
    - [x] Windows Defender
      - [x] Inmortal (Must run/survive its orbit)
      - [x] Touches you, you die.
      - [x] Bullets orbit around him

- [x] Error corrections and Quality of life changes.

Puntaje añadido: ~~0.75~~

## Upgrades and updates

## Semana 1, 15 de junio - 19 de junio (Replaning phase)

- [x] Update Design.md and Planning.md to reflect on the current state of the repository and for future changes implemented
- [x] Change component, folder, and file names to lowercase. Making sure to also change inside code to redirect to the correct file.
- [x] Implement the initial backend folder: express.js and mongodb image
- [x] Create workflows to test backend
  - [x] Start backend
  - [x] Connect to mongodb
  - [x] Test api route

## Semana 2, 22 de junio - 26 de junio

- [x] Fix starting up screen, so that it displays controls.
- [] Scoreboard and leaderboard.
  - [x] User register
  - [x] Implement a scoring method for how many computers corrupted/escaped. It should be saved in the backend alongside the user.
  - [X] User Login and cookie behaviours
  - [x] Admin Login and authentication
  - [X] Manage the GET and POST functions so that it publishes the previous scores.
- [ ] Map Progress %: Map gets more infected overtime, by changing the stage throughout.
- [x] Visual damage response to enemies and player.
- [x] Separate Enemy structure from main (its currently inside the main game)
- [ ] Change enemy sprites slightly
- [x] Add control modality (keybinds)

## Semana 3, 29 de junio - 2 de julio (jueves)

- [ ] Add an inbetween screen after loops. Strips upgrades and displays point system to upgrade basic stats.
  - [ ] Add lobby properties
  - [ ] Add the lobby screen to enter other new stages
- [ ] Enemy waves, enemy events
- [x] Enciclopedia of enemies
- [ ] Gun, enemy and player sound effects.
  - [ ] Gun sound effects
    - [ ] Disk
    - [ ] Hammer
    - [ ] Worm
    - [ ] Ads
    - [ ] Horse
  - [ ] Enemy sound effects
  - [ ] Player sound effects
  - [ ] Boss music
- [ ] Obstacle attack and make an obstacle sprite
- [ ] Boss behaviours. (make them more fair to fight against)
  - [] McAffe
  - [] Norton
    - [] Make the teleport more reactable by making it a dash instead
    - [] Change stun duration  
  - [] Windows Defender
    - [] Disables weapon
