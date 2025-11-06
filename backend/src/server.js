import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";

const start = async () => {
	await connectDB();

	// Dynamically mount question and attempt routers to avoid ESM import cycles
	try {
		const { default: questionRoutes } = await import(
			"./modules/exam/question/question.routes.js"
		);
		const { default: attemptRoutes } = await import(
			"./modules/exam/attempt/attempt.routes.js"
		);

		app.use("/api/v1/questions", questionRoutes);
		app.use("/api/v1/attempts", attemptRoutes);
	} catch (err) {
		// don't crash the server on optional route mount failure
		console.warn("Could not dynamically mount question/attempt routes:", err.message);
	}

	app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();
