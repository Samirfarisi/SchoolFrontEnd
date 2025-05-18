import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Categories from '../components/Categories';
import Stats from '../components/Stats';
import Blog from '../components/Blog';

export default function Landing() {
    return (
        <>
            <Hero />
            <About />
            <Categories />
            <Stats />
            <Blog />
        </>
    );
}
