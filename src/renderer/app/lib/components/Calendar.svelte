<script>
	import { onMount } from 'svelte';

	let { tickets = $bindable() } = $props()

	const labels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
	let selectedDate = $state(new Date());
	// current Dates
	const today = new Date();
	const currentMonth = today.getMonth()
	const currentYear = today.getFullYear()
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
		const startingDay = firstDay.getDay();
		const mondayStart = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
		let nofuture = false
		if(year === currentYear && month === currentMonth) {
			lastDay = new Date()
			nofuture = true
		}
		const totalDays = lastDay.getDate();
		// padding days
		const prevMonthDays = new Date(year, month, 0).getDate();
		for (let i = mondayStart - 1; i >= 0; i--) {
			days.push({
				day: prevMonthDays - i,
				current: false,
				month: month-1
			});
		}
		// current days
		for (let i = 1; i <= totalDays; i++) {
			days.push({
				day: i,
				current: true,
				month: month,
				year: year,
				today: i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
			});
		}
		// padding future days
		if(nofuture) {
			return
		} else {
			let remainingDays = 42 - days.length;
			for (let i = 1; i <= remainingDays; i++) {
				days.push({
					day: i,
					current: false,
					month: month+1
				});
			}
		}

		return days
	}

	function changeMonths(offset) {
		const newMonth = selectedMonth + offset
		if(newMonth > currentMonth && selectedYear === currentYear) return

		selectedMonth += offset;		
			if(selectedMonth < 0)  {
			selectedMonth = 11;
			selectedYear--;
		} else if (selectedMonth > 11) {
			selectedMonth = 0;
			selectedYear++;
		}
		generateDays(selectedYear, selectedMonth);
	}

	async function selectDate(day) {
		const selectedDay = day.day
		selectedDate = new Date(selectedYear, day.month, selectedDay)
		const formattedDay = selectedDate.toLocaleDateString('en-US', { day: '2-digit'})
		const formattedMonth = selectedDate.toLocaleDateString('en-US', { month: '2-digit'})
		const ticketRequest = await fetch(`/api/ticket?date=${selectedYear}-${formattedMonth}-${formattedDay}`)
		tickets = await ticketRequest.json()
	}

	onMount(() => {
		generateDays(selectedYear, selectedMonth);
	});
</script>

<div class="calendar">
	<div class="header">
		<div class="month">
			<button onclick={() => changeMonths(-1)}>-</button>
			<div class="text">
				<p class="title">{monthName}</p>
				<p class='year'>{selectedYear}</p>
			</div>
			<button onclick={() => changeMonths(1)}>+</button>
		</div>

		<div class="labels">
			{#each labels as label}
				<div class="day">
					<p>{label}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="body">
		{#each days as day}
			<button class="day square {day.today ? 'today' : ''} {!day.current ? 'notcurrent' : ''} {selectedDate.getDate() === day.day && selectedDate.getMonth() === day.month && selectedDate.getFullYear() === selectedYear ? 'selected':''}" onclick={() => selectDate(day)}>
				<p>{day.day}</p>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.calendar {
		margin-top: 5em;

		.header {
			.month {
				 display: flex;
				justify-content: space-between;
				align-items: center;

				button {
					background-color: var(--color-accent);
					width: 4em;
					height: 1.5em;
					border-radius: 8px;
					color: var(--color-bg);
				}

				.text {
					line-height: 1;

					.title {
						margin-bottom: 0;
					}

					.year {
						font-family: var(--font-titles);
						text-align: center;
					}
				}
			}

			.labels {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
			}

			.day {
				font-weight: 700;
			}
		}

		.body {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
		}

		.square {
			aspect-ratio: 1 / 1;
		}

		.day {
			width: 100%;
			text-align: center;
			width: 100%;
			aspect-ratio: 1 / 1;
			align-content: center;
			border-radius: 4px;
			color: var(--color-text);
			transition: 0.5s ease;
			
			p {
				text-align: center;
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
				opacity: 0.5;
			}
		}
	}
</style>
