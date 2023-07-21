export const PRECOMPUTED_TICKS = 150;
export const EXTRA_TICKS_PER_RENDER = 5;

// Friction.
export const VELOCITY_DECAY = 0.4;
// Temperature of the simulation. It's a value in the range [0,1] and it
// decreases over time. Can be seen as the probability that a node will move.
export const DEFAULT_ALPHA = 1;
// Temperature the simulation tries to converge to.
export const DEFAULT_ALPHA_TARGET = 0;
// Temperature at which the simulation is stopped.
export const DEFAULT_ALPHA_MIN = 0.05;
// The lower this value, the lower the movement of nodes that aren't being
// dragged. This also affects the perceived elasticity of relationships, a lower
// value will cause neighboring nodes to take more time to follow the node that
// is being dragged.
export const DRAGGING_ALPHA = 0.8;
// When dragging we set alphaTarget to a value greater than alphaMin to prevent
// the simulation from stopping.
export const DRAGGING_ALPHA_TARGET = 0.09;

export const LINK_DISTANCE = 45;

export const FORCE_CHARGE = -400;
export const FORCE_CENTER_X = 0.03;
export const FORCE_CENTER_Y = 0.03;

export const ZOOM_MIN_SCALE = 0.1;
export const ZOOM_MAX_SCALE = 3;
export const ZOOM_FIT_PADDING_PERCENT = 0.05;

export const FORCE_LINK_DISTANCE = (relationship: any): number =>
  relationship.source.radius + relationship.target.radius + LINK_DISTANCE * 2;
export const FORCE_COLLIDE_RADIUS = (node: any): number => node.radius + 25;

export const DEFAULT_NODE_RADIUS = 8;
export const ARROW_SIZE = 4;

export const WHITE = "#FFFFFF";
export const DEFAULT_LINK_COLOUR = "#a5abb6";
