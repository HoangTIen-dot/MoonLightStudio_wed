export const marqueeRows: string[][] = [
  [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHpzdG93OGYzNGZ5YjI3YnJ2OTZhNHR5bmRjMDhva3pzbG5lbTRzbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjd3eDhsOHluZzNiaDF4dnVnMWl0ejFsYWN1ZnFzc3B3NmJqcGdkNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGtyM3JoNmU1MGw5cmZ4aDhoN2IzMm00ZjE3OWQ4dnNzMW56eXF6NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7bu3XilJ5BOiSGic/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnRyOHVxcnp0MGp2ajM1eDluem1yYzBhd2ZhY2k3OG5yZ2N5bTYyZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlOaQcLJ2hHpYdy/giphy.gif',
  ],
  [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjNhNjN0bzN6OGxnamx0dDR2ZXB2ZGI4NHg0ZnY2bG4wbXJhcHByNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oKIPtjElfqwMOTbH2/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTdxbWlqOGpkZ3J1NTdtNmxleWMxbDByZW4zNnR1MWVzZXpiMWtxeiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2gxMzNlcmdoOXZoaHc2OWQ0a2pqaHd1anUzMGd6djlmMG9rY3A3ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xTiTnxpQ3ghPiB2Hp6/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXV6bmUwN2txb3Z1cG1pM3N3Z2o4OTljNjBlcnViY29rMmw5cXJ4cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oz8xIsloV7zOmt81G/giphy.gif',
  ],
];

export const decorativeImages: string[] = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1617791160536-598cf32026fb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=900&q=80',
];

export type Service = [number: string, title: string, description: string];

export const services: Service[] = [
  ['01', 'CGI', 'Creation of top-tier 3D visualizations, animations, and visual effects for media including images, films, and interactive applications.'],
  ['02', 'Color Grading', 'Expert color grading solutions to enhance the mood, consistency, and overall aesthetic of video content.'],
  ['03', 'VFX', 'Comprehensive visual effects services including compositing, layering, and the generation of particle effects or explosions.'],
  ['04', 'Post Production', 'Specialized technical services including tracking, matchmoving, rotoscoping, and matte painting to integrate virtual elements with live-action footage.'],
  ['05', 'Graphics', '2D and 3D graphics and motion graphics services, including everything from typefaces to creating captivating animated sequences.'],
  ['06', 'Production Support', 'Support for animatics during production house pitching and animation demos for the pre-production phase.'],
];

export type Project = {
  title: string;
  type: string;
  image: string;
  brandName?: string;
  brandLogoUrl?: string;
  description?: string;
  videoEmbedUrl?: string;
};

export const projects: Project[] = [
  {
    title: 'Chrome Bloom',
    type: 'Brand Film',
    image: 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?auto=format&fit=crop&w=1400&q=85',
  },
  {
    title: 'Liquid Signal',
    type: 'Interactive Launch',
    image: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?auto=format&fit=crop&w=1400&q=85',
  },
  {
    title: 'Soft Machine',
    type: 'Product System',
    image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&w=1400&q=85',
  },
];
