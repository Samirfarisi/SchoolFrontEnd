import React from "react";
import aboutMain from "../assets/Rissana School.webp";
import aboutShape2 from "../assets/about-shape-2.svg";
import aboutShape3 from "../assets/about-shape-3.png";
import aboutShape4 from "../assets/about-shape-4.svg";
// Import dedicated CSS file for About section
import "./about.css";

const About = () => (
    <section className="section about" id="about" aria-label="about">
        <div className="container">
            <figure className="about-banner">
                <div className="img-holder" style={{ "--width": "520", "--height": "370" }}>
                    <img
                        src={aboutMain}
                        width="520"
                        height="370"
                        loading="lazy"
                        alt="about banner"
                        className="img-cover"
                    />
                </div>

                <img
                    src={aboutShape2}
                    width="371"
                    height="220"
                    loading="lazy"
                    alt=""
                    className="shape about-shape-2"
                />
                <img
                    src={aboutShape3}
                    width="722"
                    height="528"
                    loading="lazy"
                    alt=""
                    className="shape about-shape-3"
                />
            </figure>

            <div className="about-content">
                <p className="section-subtitle">About Us</p>
                <h2 className="h2 section-title">
                    Ezzouada school <span className="span">About Page</span> for EveryOne
                </h2>
                <p className="section-text">
                    Lorem ipsum dolor sit amet consectur adipiscing elit sed eiusmod ex tempor incididunt
                    labore dolore magna aliquaenim ad minim.
                </p>

                <ul className="about-list">
                    <li className="about-item">
                        <ion-icon name="checkmark-done-outline" aria-hidden="true" />
                        <span className="span">lorem lorem</span>
                    </li>
                    <li className="about-item">
                        <ion-icon name="checkmark-done-outline" aria-hidden="true" />
                        <span className="span">lorem lorem</span>
                    </li>
                    <li className="about-item">
                        <ion-icon name="checkmark-done-outline" aria-hidden="true" />
                        <span className="span">lorem lorem</span>
                    </li>
                </ul>

                <img
                    src={aboutShape4}
                    width="100"
                    height="100"
                    loading="lazy"
                    alt=""
                    className="shape about-shape-4"
                />

                
                <div className="about-map" style={{ marginTop: "2rem", borderRadius: "10px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                    <iframe
                        title="Ezzouada School Location"
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13459.960239005953!2d-8.9156924!3d32.3470206!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7c243b9eaa6d1%3A0xa1d958289d9e98a9!2sEzzouada!5e0!3m2!1sen!2sma!4v1714068351222!5m2!1sen!2sma"
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    </section>
);

export default About;