<script>
	import { onMount } from 'svelte';

	// Changed from bindable to a regular prop that expects a function
	let { onTicketsRequested: updateParentTickets } = $props();

	const labels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
	let selectedDate = $state(new Date());
	const today = new Date();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();
	let selectedMonth = $state(today.getMonth());
	let selectedYear = $state(today.getFullYear());
	let monthName = $derived(
			new Date(selectedYear, selectedMonth).toLocaleString('es', { month: 'long' })
	);
	let days = $state([]);

	function generateDays(year, month) {
		days = [];
		const firstDay = new Date(year, month, 1);
		let lastDay = new Date(year, month + 1, 0);
		const mondayStart = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
		let nofuture = false;
		if (year === currentYear && month === currentMonth) {
			lastDay = new Date(); // Only show up to today for the current month
			nofuture = true;
		}
		const totalDaysInMonth = lastDay.getDate();

		// padding days from previous month
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = mondayStart - 1; i >= 0; i--) {
			days.push({
				day: prevMonthLastDay - i,
				current: false,
				month: month - 1 < 0 ? 11 : month -1, // handle year wrap for month
				year: month - 1 < 0 ? year -1 : year
			});
		}
		// current month days
		for (let i = 1; i <= totalDaysInMonth; i++) {
			days.push({
				day: i,
				current: true,
				month: month,
				year: year,
				today: i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
			});
		}
		// padding future days (only if not current month and year)
		if (!nofuture) {
			let remainingDays = 42 - days.length; // Assuming a 6x7 grid
			for (let i = 1; i <= remainingDays; i++) {
				days.push({
					day: i,
					current: false,
					month: month + 1 > 11 ? 0 : month + 1, // handle year wrap for month
					year: month + 1 > 11 ? year + 1 : year
				});
			}
		}
		// Ensure days array has 42 items for a consistent 6x7 grid, if needed for styling
		while (days.length < 42 && nofuture) {
			const lastDayInArray = days[days.length -1];
			const nextDayDate = new Date(lastDayInArray.year, lastDayInArray.month, lastDayInArray.day + 1);
			if (nextDayDate.getFullYear() === currentYear && nextDayDate.getMonth() === currentMonth && nextDayDate.getDate() > today.getDate()) {
				// Stop adding future days of the current month beyond today
				break;
			}
			days.push({
				day: nextDayDate.getDate(),
				current: false,
				month: nextDayDate.getMonth(),
				year: nextDayDate.getFullYear(),
			});
		}
		return days;
	}

	async function changeMonths(offset) {
		const newDate = new Date(selectedYear, selectedMonth + offset, 1);
		if (newDate.getFullYear() > currentYear || (newDate.getFullYear() === currentYear && newDate.getMonth() > currentMonth)) {
			return; // Don't go into future months
		}
		selectedMonth = newDate.getMonth();
		selectedYear = newDate.getFullYear();
		generateDays(selectedYear, selectedMonth);
		// Fetch tickets for the first day of the new month
		await selectDate({ day: 1, month: selectedMonth, year: selectedYear, current: true });
	}

	async function selectDate(dayObj) {
		selectedDate = new Date(dayObj.year, dayObj.month, dayObj.day);
		const dateString = `${dayObj.year}-${('0' + (dayObj.month + 1)).slice(-2)}-${('0' + dayObj.day).slice(-2)}`;

		if (window.api && typeof window.api.getTicketsByDate === 'function') {
			try {
				const fetchedTickets = await window.api.getTicketsByDate(dateString);
				if (fetchedTickets && !fetchedTickets.error) {
					if (typeof updateParentTickets === 'function') {
						updateParentTickets(fetchedTickets); // Call the callback
					} else {
						console.warn("Calendar: updateParentTickets is not a function");
					}
				} else {
					console.error("Error fetching tickets via IPC from Calendar:", fetchedTickets?.error || "Unknown error");
					if (typeof updateParentTickets === 'function') updateParentTickets([]);
				}
			} catch (ipcError) {
				console.error("IPC call to getTicketsByDate from Calendar failed:", ipcError);
				if (typeof updateParentTickets === 'function') updateParentTickets([]);
			}
		} else {
			console.warn('[Calendar.svelte] window.api.getTicketsByDate is not available.');
			if (typeof updateParentTickets === 'function') updateParentTickets([]);
		}
	}

	onMount(async () => {
		generateDays(selectedYear, selectedMonth);
		// Fetch tickets for the initially selected date (today)
		await selectDate({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear(), current: true });
	});
</script>

<div class="calendar">
	<div class="header">
		<div class="month">
			<button onclick={() => changeMonths(-1)} aria-label="Previous month">-</button>
			<div class="text">
				<p class="title">{monthName}</p>
				<p class='year'>{selectedYear}</p>
			</div>
			<button onclick={() => changeMonths(1)} aria-label="Next month"
					disabled={selectedYear === currentYear && selectedMonth === currentMonth}>+</button>
		</div>
		<div class="labels">
			{#each labels as label}
				<div class="day-label"> <!-- Changed class for clarity -->
					<p>{label}</p>
				</div>
			{/each}
		</div>
	</div>
	<div class="body">
		{#each days as dayObj (dayObj.year + '-' + dayObj.month + '-' + dayObj.day + '-' + dayObj.current)}
			<button
					class="day square {dayObj.today ? 'today' : ''} {!dayObj.current ? 'notcurrent' : ''} {selectedDate.getDate() === dayObj.day && selectedDate.getMonth() === dayObj.month && selectedDate.getFullYear() === dayObj.year ? 'selected':''}"
					onclick={() => dayObj.current && selectDate(dayObj)}
					disabled={!dayObj.current || (dayObj.year === currentYear && dayObj.month === currentMonth && dayObj.day > today.getDate())}
					aria-label={`Select date ${dayObj.day} ${new Date(dayObj.year, dayObj.month).toLocaleString('es', { month: 'long' })} ${dayObj.year}`}
			>
				<p>{dayObj.day}</p>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.calendar {
		margin-top: 5em; // This seems large, consider reducing or making it a variable

		.header {
			.month {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 1em; // Added some space

				button {
					background-color: var(--color-accent);
					width: 3em; // Reduced width
					height: 2em; // Increased height for better clickability
					border-radius: 8px;
					color: var(--color-bg);
					font-size: 1em; // Ensure font size is appropriate

					&:disabled {
						background-color: var(--color-light);
						opacity: 0.5;
						cursor: not-allowed;
					}
				}

				.text {
					line-height: 1.2; // Adjusted line height
					text-align: center; // Center month/year text

					.title {
						margin-bottom: 0.25em; // Slight space between month and year
						font-size: 1.2em; // Make month name a bit larger
					}

					.year {
						font-family: var(--font-titles);
					}
				}
			}

			.labels {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				text-align: center; // Center day labels
				margin-bottom: 0.5em; // Space before days grid
			}

			.day-label { // Changed from .day to avoid conflict
				font-weight: 700;
				color: var(--color-text-secondary);
			}
		}

		.body {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			gap: 0.5em; // Added gap between day buttons
		}

		.square { // This class seems to be applied to day buttons
			aspect-ratio: 1 / 1;
		}

		.day { // Styles for individual day buttons
			width: 100%;
			text-align: center;
			align-content: center; // For flex/grid items if button becomes a container
			border-radius: 4px;
			color: var(--color-text);
			transition: background-color 0.3s ease, color 0.3s ease; // Smoother transition
			border: 1px solid transparent; // Placeholder for focus styles

			&:hover:not(:disabled) {
				background-color: var(--color-hover);
			}
			&:focus-visible {
				outline: 2px solid var(--color-accent);
				border-color: var(--color-accent);
			}


			p {
				text-align: center; // Ensure text within p is centered
			}

			&.today {
				font-weight: bold;
				border: 1px solid var(--color-accent); // Highlight today
			}

			&.selected {
				background-color: var(--color-accent);
				p {
					color: var(--color-bg);
					font-weight: 700;
				}
			}

			&.notcurrent {
				color: var(--color-text-secondary);
				opacity: 0.6; // Slightly more visible than 0.5
				pointer-events: none; // Make non-current month days unclickable
			}
			&:disabled:not(.notcurrent) { // Style for disabled current month future days
				opacity: 0.5;
				cursor: not-allowed;
				background-color: transparent; // Or a specific disabled color
				color: var(--color-text-secondary);
			}
		}
	}
</style>
