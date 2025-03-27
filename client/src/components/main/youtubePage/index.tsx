import { useContext } from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import useYoutubeVideos from '../../../hooks/useYoutubeVideos';
import UserContext from '../../../contexts/UserContext';

/**
 * Represents the YouTubeVideoPage component which displays a list of embedded YouTube videos
 * fetched based on the tags of the user's most recent question.
 */
const YouTubeVideoPage = () => {
  const context = useContext(UserContext);
  const username = context?.user.username;
  const { videos, loading, error } = useYoutubeVideos(username || '');

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4' fontWeight='bold'>
            Recommended YouTube Videos
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2,
          padding: 4,
          paddingTop: 0,
        }}>
        {loading && <CircularProgress />}
        {!loading && error && <Typography color='error'>{error}</Typography>}
        {!loading && !error && videos.length === 0 && (
          <Typography>Ask a question with tags to see recommended videos!</Typography>
        )}
        {!loading &&
          !error &&
          videos.length > 0 &&
          videos.map(video => (
            <Box key={video.url} sx={{ textAlign: 'center' }}>
              <iframe
                width='100%'
                height='200'
                src={video.url.replace('watch?v=', 'embed/')}
                title={video.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
              <Typography variant='subtitle1' fontWeight='bold'>
                {video.title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {video.channelTitle}
              </Typography>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default YouTubeVideoPage;
