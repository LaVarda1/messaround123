import { V3 } from "../vec"

export enum TYPE {
  brush = 0,
  sprite = 1,
  alias =2
};

export type STVert = {
  onseam: boolean
  s: number
  t: number
}
export type Triangle = {
  facesfront: boolean,
  vertindex: V3
}
export type Model = {
  type: TYPE
  player:  boolean
  scale: V3
  scale_origin: V3
  boundingradius: number
  numskins: number
  skinwidth: number
  skinheight: number
  numverts: number
  numtris: number
  numframes: number
  random: boolean
  flags: number
  mins: V3
  maxs: V3
  stverts: STVert[]
  triangles: Triangle[]
}