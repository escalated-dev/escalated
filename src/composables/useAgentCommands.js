import { onMounted, onUnmounted, ref } from 'vue';

/**
 * The command registry behind the agent command palette.
 *
 * Pages render the agent shell inside themselves, so the shell cannot provide
 * the registry to them; it is a module-level list instead. Pages add the
 * actions that make sense for what they show (resolve this ticket, assign it
 * to me) and those actions leave the palette when the page unmounts.
 *
 * Registration happens on mount only, so nothing accumulates during server
 * rendering, where components never unmount.
 *
 * A command is `{ id, label, group?, hint?, keywords?, run }`.
 */
const commands = ref([]);

export function agentCommands() {
    return commands;
}

export function registerAgentCommands(list) {
    const added = list.map((command) => ({ ...command }));
    commands.value = [...commands.value, ...added];
    return () => {
        commands.value = commands.value.filter((command) => !added.includes(command));
    };
}

/**
 * Add commands to the palette for as long as the calling component is mounted.
 * `list` may be an array or a function returning one (read when mounted).
 */
export function useAgentCommands(list) {
    let unregister = () => {};
    onMounted(() => {
        unregister = registerAgentCommands(typeof list === 'function' ? list() : list);
    });
    onUnmounted(() => unregister());
}
