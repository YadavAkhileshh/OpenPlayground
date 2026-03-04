import React from 'react';
import SnippetList from '../components/SnippetList';
import API_URL from '../api';

const Favorites = () => {
    return <SnippetList title="Important" fetchUrl={`${API_URL}/snippets`} params={{ favorite: 'true' }} />;
};

export default Favorites;
