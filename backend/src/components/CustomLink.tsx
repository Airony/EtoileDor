import React from "react";
import { NavLink } from "react-router-dom";
import { Chevron } from "payload/components/icons";

interface CustomLinkProps {
    to: string;
    label: string;
}

function CustomLink({ to, label }: CustomLinkProps) {
    return (
        <NavLink to={to} activeClassName="active" className="nav__link">
            <span className="nav__link-icon">
                <Chevron direction="right" size="large" />
            </span>
            <span className="nav__link-label">{label}</span>
        </NavLink>
    );
}

export default CustomLink;
