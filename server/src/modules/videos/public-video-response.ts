type PublicVideoCandidate = {
  projectId?: unknown;
};

export function filterVideosWithPublishedProjects<TVideo extends PublicVideoCandidate>(videos: TVideo[]) {
  return videos.filter((video) => {
    const project = video.projectId;
    return Boolean(
      project &&
        typeof project === 'object' &&
        'isPublished' in project &&
        (project as { isPublished?: boolean }).isPublished,
    );
  });
}
