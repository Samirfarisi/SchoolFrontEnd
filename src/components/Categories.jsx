import React from "react";
import TroncCommun from "../assets/Tronc Commun.svg";
import graduationsvgrepo from "../assets/graduation-svgrepo-com.svg";

// Import enhanced categories styling
import "./categories.css";

const Categories = () => (
    <section className="section category" aria-label="category">
        <div className="container">
            <p className="section-subtitle">Categories</p>

            <h2 className="h2 section-title">
                Online <span className="span">Classes</span> For Remote Learning.
            </h2>

            <p className="section-text">
                Consectetur adipiscing elit sed do eiusmod tempor.
            </p>

            <ul className="grid-list">
                <li>
                    <div className="category-card" style={{ "--color": "170, 75%, 41%" }}>
                        <div className="card-icon">
                            <img
                                src={TroncCommun}
                                width="40"
                                height="40"
                                loading="lazy"
                                alt="Tronc Commun"
                                className="img"
                            />
                        </div>
                        <h3 className="h3">
                            <a href="#" className="card-title">
                                Tronc Commun
                            </a>
                        </h3>
                        <p className="card-text">
                            Lorem ipsum dolor consec tur elit adicing sed umod tempor.
                        </p>
                        <span className="card-badge">Disponible</span>
                    </div>
                </li>

                <li>
                    <div className="category-card" style={{ "--color": "351, 83%, 61%" }}>
                        <div className="card-icon">
                            <img
                                src={TroncCommun}
                                width="40"
                                height="40"
                                loading="lazy"
                                alt="1Bac"
                                className="img"
                            />
                        </div>
                        <h3 className="h3">
                            <a href="#" className="card-title">
                                1Bac
                            </a>
                        </h3>
                        <p className="card-text">
                            Lorem ipsum dolor consec tur elit adicing sed umod tempor.
                        </p>
                        <span className="card-badge">Disponible</span>
                    </div>
                </li>

                <li>
                    <div className="category-card" style={{ "--color": "229, 75%, 58%" }}>
                        <div className="card-icon">
                            <img
                                src={graduationsvgrepo}
                                width="40"
                                height="40"
                                loading="lazy"
                                alt="2Bac"
                                className="img"
                            />
                        </div>
                        <h3 className="h3">
                            <a href="#" className="card-title">
                                2Bac
                            </a>
                        </h3>
                        <p className="card-text">
                            Lorem ipsum dolor consec tur elit adicing sed umod tempor.
                        </p>
                        <span className="card-badge">Disponible</span>
                    </div>
                </li>

               
            </ul>
        </div>
    </section>
);

export default Categories;
