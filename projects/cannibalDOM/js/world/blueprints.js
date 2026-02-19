/* js/world/blueprints.js */
export const Blueprints = {
    blogPost: {
        type: 'div',
        className: 'blog-post dummy-card',
        styles: { width: '400px', backgroundColor: '#fff', border: '1px solid #ddd' },
        children: [
            {
                type: 'div',
                styles: { height: '150px', backgroundColor: '#aaa', marginBottom: '15px' },
                className: 'post-image'
            },
            {
                type: 'h2',
                text: 'Understanding DOM Manipulation',
                styles: { color: '#333', marginBottom: '10px' }
            },
            {
                type: 'p',
                text: 'The Document Object Model is a cross-platform and language-independent interface...',
                styles: { color: '#666', lineHeight: '1.6' }
            },
            {
                type: 'button',
                text: 'Read More',
                className: 'dummy-btn',
                styles: { marginTop: '10px', backgroundColor: '#3498db' }
            }
        ]
    },

    loginForm: {
        type: 'div',
        className: 'login-form dummy-card',
        styles: { width: '300px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', padding: '30px' },
        children: [
            { type: 'h3', text: 'Sign In', styles: { textAlign: 'center', marginBottom: '20px' } },
            {
                type: 'div',
                styles: { marginBottom: '15px' },
                children: [
                    { type: 'label', text: 'Username', styles: { display: 'block', marginBottom: '5px' } },
                    { type: 'input', styles: { width: '100%', padding: '8px', border: '1px solid #ddd' } }
                ]
            },
            {
                type: 'div',
                styles: { marginBottom: '15px' },
                children: [
                    { type: 'label', text: 'Password', styles: { display: 'block', marginBottom: '5px' } },
                    { type: 'input', styles: { width: '100%', padding: '8px', border: '1px solid #ddd', backgroundColor: '#eef' } }
                ]
            },
            {
                type: 'button',
                text: 'Login',
                styles: { width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none' }
            }
        ]
    },

    navBar: {
        type: 'div',
        styles: { width: '800px', height: '60px', backgroundColor: '#333', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' },
        children: [
            { type: 'h1', text: 'Logo', styles: { color: 'white', fontSize: '24px' } },
            {
                type: 'div',
                styles: { display: 'flex', gap: '20px' },
                children: [
                    { type: 'a', text: 'Home', styles: { color: '#bbb' } },
                    { type: 'a', text: 'About', styles: { color: '#bbb' } },
                    { type: 'a', text: 'Contact', styles: { color: '#bbb' } },
                    { type: 'button', text: 'Sign Up', styles: { padding: '5px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none' } }
                ]
            }
        ]
    },

    pricingTable: {
        type: 'div',
        className: 'pricing-table dummy-card',
        styles: { display: 'flex', gap: '10px', backgroundColor: 'transparent', border: 'none' },
        children: [
            {
                type: 'div',
                styles: { width: '150px', backgroundColor: '#fff', padding: '20px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
                children: [
                    { type: 'h4', text: 'Basic', styles: { color: '#333' } },
                    { type: 'h2', text: '$9', styles: { color: '#2ecc71', margin: '10px 0' } },
                    { type: 'p', text: '10 Projects', styles: { fontSize: '12px', color: '#777' } },
                    { type: 'button', text: 'Buy', className: 'dummy-btn', styles: { width: '100%', marginTop: '10px' } }
                ]
            },
            {
                type: 'div',
                styles: { width: '150px', backgroundColor: '#fff', padding: '20px', textAlign: 'center', border: '2px solid #2ecc71', transform: 'scale(1.1)' },
                children: [
                    { type: 'h4', text: 'Pro', styles: { color: '#333' } },
                    { type: 'h2', text: '$29', styles: { color: '#2ecc71', margin: '10px 0' } },
                    { type: 'p', text: 'Unlimited', styles: { fontSize: '12px', color: '#777' } },
                    { type: 'button', text: 'Buy', className: 'dummy-btn', styles: { width: '100%', marginTop: '10px', backgroundColor: '#2ecc71' } }
                ]
            }
        ]
    },

    heroSection: {
        type: 'div',
        styles: { width: '900px', padding: '50px', backgroundColor: '#2c3e50', color: 'white', textAlign: 'center' },
        children: [
            { type: 'h1', text: 'Welcome to the Future', styles: { fontSize: '48px', marginBottom: '20px' } },
            { type: 'p', text: 'Experience the next generation of web interaction.', styles: { fontSize: '18px', marginBottom: '30px', opacity: '0.8' } },
            { type: 'button', text: 'Get Started', styles: { padding: '15px 30px', fontSize: '18px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '30px' } }
        ]
    },

    sidebar: {
        type: 'div',
        className: 'sidebar dummy-card',
        styles: { width: '200px', backgroundColor: '#ecf0f1', padding: '15px', height: '300px' },
        children: [
            { type: 'input', styles: { width: '100%', marginBottom: '15px', padding: '8px', border: '1px solid #bdc3c7' } },
            { type: 'div', text: 'Dashboard', styles: { padding: '10px', borderBottom: '1px solid #bdc3c7', color: '#2c3e50' } },
            { type: 'div', text: 'Settings', styles: { padding: '10px', borderBottom: '1px solid #bdc3c7', color: '#2c3e50' } },
            { type: 'div', text: 'Profile', styles: { padding: '10px', borderBottom: '1px solid #bdc3c7', color: '#2c3e50' } },
            { type: 'div', text: 'Logout', styles: { padding: '10px', color: '#c0392b' } }
        ]
    }
};

export const getRandomBlueprint = () => {
    const keys = Object.keys(Blueprints);
    return Blueprints[keys[Math.floor(Math.random() * keys.length)]];
};
