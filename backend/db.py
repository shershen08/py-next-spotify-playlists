from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Track:
    id: str
    name: str
    artist: str
    album: str
    duration_ms: int
    image_url: Optional[str] = None


# Mocked playlist data
MOCK_TRACKS: List[Track] = [
    Track(
        id="track_1",
        name="Bohemian Rhapsody",
        artist="Queen",
        album="A Night at the Opera",
        duration_ms=354000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+1"
    ),
    Track(
        id="track_2",
        name="Hotel California",
        artist="Eagles",
        album="Hotel California",
        duration_ms=391000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+2"
    ),
    Track(
        id="track_3",
        name="Stairway to Heaven",
        artist="Led Zeppelin",
        album="Led Zeppelin IV",
        duration_ms=482000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+3"
    ),
    Track(
        id="track_4",
        name="Imagine",
        artist="John Lennon",
        album="Imagine",
        duration_ms=183000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+4"
    ),
    Track(
        id="track_5",
        name="Sweet Child O' Mine",
        artist="Guns N' Roses",
        album="Appetite for Destruction",
        duration_ms=356000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+5"
    ),
    Track(
        id="track_6",
        name="Billie Jean",
        artist="Michael Jackson",
        album="Thriller",
        duration_ms=294000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+6"
    ),
    Track(
        id="track_7",
        name="Like a Rolling Stone",
        artist="Bob Dylan",
        album="Highway 61 Revisited",
        duration_ms=366000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+7"
    ),
    Track(
        id="track_8",
        name="Smells Like Teen Spirit",
        artist="Nirvana",
        album="Nevermind",
        duration_ms=301000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+8"
    ),
    Track(
        id="track_9",
        name="What's Going On",
        artist="Marvin Gaye",
        album="What's Going On",
        duration_ms=233000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+9"
    ),
    Track(
        id="track_10",
        name="Good Vibrations",
        artist="The Beach Boys",
        album="Smiley Smile",
        duration_ms=216000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+10"
    ),
    Track(
        id="track_11",
        name="Johnny B. Goode",
        artist="Chuck Berry",
        album="Chuck Berry Is on Top",
        duration_ms=161000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+11"
    ),
    Track(
        id="track_12",
        name="Hey Jude",
        artist="The Beatles",
        album="The Beatles",
        duration_ms=431000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+12"
    ),
    Track(
        id="track_13",
        name="Purple Rain",
        artist="Prince",
        album="Purple Rain",
        duration_ms=518000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+13"
    ),
    Track(
        id="track_14",
        name="Thunder Road",
        artist="Bruce Springsteen",
        album="Born to Run",
        duration_ms=296000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+14"
    ),
    Track(
        id="track_15",
        name="Layla",
        artist="Derek and the Dominos",
        album="Layla and Other Assorted Love Songs",
        duration_ms=428000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+15"
    ),
    Track(
        id="track_16",
        name="A Day in the Life",
        artist="The Beatles",
        album="Sgt. Pepper's Lonely Hearts Club Band",
        duration_ms=335000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+16"
    ),
    Track(
        id="track_17",
        name="Gimme Shelter",
        artist="The Rolling Stones",
        album="Let It Bleed",
        duration_ms=271000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+17"
    ),
    Track(
        id="track_18",
        name="The Sound of Silence",
        artist="Simon & Garfunkel",
        album="Sounds of Silence",
        duration_ms=227000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+18"
    ),
    Track(
        id="track_19",
        name="Dancing Queen",
        artist="ABBA",
        album="Arrival",
        duration_ms=230000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+19"
    ),
    Track(
        id="track_20",
        name="Don't Stop Believin'",
        artist="Journey",
        album="Escape",
        duration_ms=251000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+20"
    ),
    Track(
        id="track_21",
        name="I Will Always Love You",
        artist="Whitney Houston",
        album="The Bodyguard",
        duration_ms=273000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+21"
    ),
    Track(
        id="track_22",
        name="Hallelujah",
        artist="Jeff Buckley",
        album="Grace",
        duration_ms=412000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+22"
    ),
    Track(
        id="track_23",
        name="Wonderwall",
        artist="Oasis",
        album="(What's the Story) Morning Glory?",
        duration_ms=258000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+23"
    ),
    Track(
        id="track_24",
        name="Creep",
        artist="Radiohead",
        album="Pablo Honey",
        duration_ms=238000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+24"
    ),
    Track(
        id="track_25",
        name="Seven Nation Army",
        artist="The White Stripes",
        album="Elephant",
        duration_ms=231000,
        image_url="https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Track+25"
    ),
]

