export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  url: string;
  coverGradient: string;
  playlist?: string;
}

export interface PlaylistInfo {
  id: string;
  name: string;
  count: number;
}
