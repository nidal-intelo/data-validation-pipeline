import { app } from '@azure/functions';
import { dataTrigger } from './handler/dataTrigger';

// Register Azure Function
app.eventGrid('fileProcessor', {
    handler: dataTrigger,
});