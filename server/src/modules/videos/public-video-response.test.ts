import { describe, expect, it } from 'vitest';
import { filterVideosWithPublishedProjects } from './public-video-response.js';

describe('filterVideosWithPublishedProjects', () => {
  it('removes videos whose populated project is missing or unpublished', () => {
    const publishedVideo = {
      title: 'Published video',
      projectId: {
        title: 'Published project',
        isPublished: true,
      },
    };

    const draftProjectVideo = {
      title: 'Draft project video',
      projectId: {
        title: 'Draft project',
        isPublished: false,
      },
    };

    const missingProjectVideo = {
      title: 'Missing project video',
      projectId: null,
    };

    expect(filterVideosWithPublishedProjects([publishedVideo, draftProjectVideo, missingProjectVideo])).toEqual([
      publishedVideo,
    ]);
  });
});
