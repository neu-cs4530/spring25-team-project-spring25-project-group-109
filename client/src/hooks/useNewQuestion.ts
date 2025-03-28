import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addQuestion } from '../services/questionService';
import useUserContext from './useUserContext';
import useTagPage from './useTagPage';

/**
 * Custom hook to handle question submission and form validation
 *
 * @returns title - The current value of the title input.
 * @returns text - The current value of the text input.
 * @returns tagNames - The current value of the tags input.
 * @returns titleErr - Error message for the title field, if any.
 * @returns textErr - Error message for the text field, if any.
 * @returns tagErr - Error message for the tag field, if any.
 * @returns postQuestion - Function to validate the form and submit a new question.
 */
const useNewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [tagNames, setTagNames] = useState<string[]>([]);

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');

  const { tlist } = useTagPage();
  const existingTags = tlist.map(t => t.name);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else {
      setTextErr('');
    }

    if (tagNames.length === 0) {
      setTagErr('At least one tag is required');
      isValid = false;
    } else if (tagNames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    return isValid;
  };

  const postQuestion = async () => {
    if (!validateForm()) return;

    const tags = tagNames.map(tag => ({ name: tag, description: 'user-added tag' }));

    const question = {
      title,
      text,
      tags,
      askedBy: user.username,
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
    };

    const res = await addQuestion(question);
    if (res && res._id) {
      navigate('/home');
    }
  };

  return {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
    existingTags,
  };
};

export default useNewQuestion;
