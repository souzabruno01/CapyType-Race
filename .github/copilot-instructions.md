Agent Instructions - CapyType-Race Project

This document details the guidelines and expectations for the agent working on the CapyType-Race project. The objective is to ensure consistent, high-quality development aligned with the project's vision, focusing on modernity, responsiveness, performance, and security.

1. UI/Style and Logic Guidelines

1.1 Preservation of Existing UI/Style and Logic

The agent must strictly preserve the visual style, colors, layout, and existing UI/UX logic of the CapyType-Race project, unless explicitly instructed to make changes. This includes, but is not limited to:

•
Colors: Maintain the current color palette for all interface elements.

•
Typography: Respect the fonts, sizes, and weights used.

•
Layout: Preserve the organization and positioning of elements on the screen.

•
Components: Do not alter the appearance or behavior of existing UI components (buttons, input fields, cards, etc.) without approval.

•
Business Logic: The logic of how the game functions, player interaction, and data flow should not be altered without a specific request.

Any change to the UI, style, or logic should be considered an exception, not the rule. The agent must be aware that visual and functional consistency is paramount for the CapyType-Race user experience.

1.2 Approval Process for Changes

For any change affecting the existing UI, style, or logic, the following approval process must be followed:

1.
Notification: The agent must notify the user about the need for or suggestion of a change, clearly explaining the reason and impact.

2.
Proposal: Present a detailed proposal for the change, including:

•
Description of the change.

•
Justification (why the change is necessary or beneficial).

•
Specific UI/style components or logic parts that will be affected.

•
Visual suggestions (if applicable) or code examples.



3.
Approval: The change can only be implemented after explicit user approval. The agent must await confirmation before proceeding.

4.
Implementation: After approval, the agent can implement the change, ensuring it complies with the approved proposal.

5.
Verification: After implementation, the agent must verify that the change has been applied correctly and has not introduced regressions or unintended side effects.

The agent should always seek user approval for any deviation from the UI/style and logic preservation guidelines.

2. Modernity and Top Features

The agent must work to keep the CapyType-Race project modern and aligned with market best practices and features. This includes:

•
Dependency Updates: Keep libraries and frameworks (React, Node.js, Tailwind CSS, etc.) updated to the latest stable versions, leveraging performance improvements, security, and new features.

•
Code Standards: Adopt and maintain clean, readable, and easily maintainable code standards, using the conventions of each technology (TypeScript, React Hooks, etc.).

•
New Features: Propose and implement new features that add value to the game and user experience, always seeking innovations and trends in the gaming and web application market.

•
Proactive Suggestions: The agent is encouraged to make proactive suggestions for improvements and new features, presenting the benefits and technical feasibility to the user before implementation.

3. Responsiveness

The application must be fully responsive, providing a consistent and pleasant user experience across different devices and screen sizes (desktops, tablets, and smartphones). Guidelines include:

•
Adaptive Design: Use adaptive and responsive design techniques, such as media queries and flexible layouts (Flexbox, Grid), to ensure the UI adjusts dynamically.

•
Device Testing: Conduct tests on different resolutions and devices to identify and correct layout and usability issues.

•
Image Optimization: Optimize images and other media assets to ensure fast loading and good visual quality on all screens.

4. Performance (Lag-Free)

Application performance is crucial for a real-time typing game. The agent must strive to ensure a lag-free and fluid experience. Guidelines include:

•
Code Optimization: Write efficient and optimized code, minimizing costly operations and performance bottlenecks.

•
State Management: Effectively use state management (Zustand) to avoid unnecessary re-renders and ensure the UI reflects the game state in real-time.

•
Animation Optimization: Ensure animations (Framer Motion) are smooth and do not cause frame rate drops, even on less powerful devices.

•
Real-time Communication: Optimize Socket.IO communication to ensure low latency and high data throughput, essential for the multiplayer experience.

•
Performance Testing: Conduct performance tests and identify areas for improvement, using performance profiling tools when necessary.

5. Security

Application security is fundamental to protect user data and game integrity. The agent must follow security best practices at all stages of development:

•
Input Validation: Validate all user inputs on the frontend and, crucially, on the backend to prevent attacks such as code injection and malicious scripts.

•
Protection against Common Attacks: Implement protection measures against common web attacks, such as XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), and brute-force attacks.

•
Session Management: Securely manage user sessions, using tokens and recommended practices for authentication and authorization.

•
Data Security: Protect sensitive data in transit and at rest, using encryption and other security measures.

•
Security Updates: Keep all dependencies and the runtime environment updated to mitigate known security vulnerabilities.

•
Security Audits: Conduct periodic security audits and promptly respond to any discovered vulnerabilities.

