<?php
/**
 * Company Holidays & Work Calendar Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/HolidayModel.php';

class HolidayTest
{
    private PDO $db;
    private HolidayModel $model;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new HolidayModel($this->db);
    }

    private function assert($condition, string $message): void
    {
        if ($condition) {
            echo "  \033[32m✔ PASS:\033[0m $message\n";
            $this->passed++;
        } else {
            echo "  \033[31m✖ FAIL:\033[0m $message\n";
            $this->failed++;
        }
    }

    public function getPassed(): int { return $this->passed; }
    public function getFailed(): int { return $this->failed; }

    public function run(): array
    {
        echo "\n── Company Holidays & Calendar Tests ──\n";

        $this->testHolidaysRetrieval();
        $this->testHolidayFilters();
        $this->testHolidayCrud();
        $this->testUpcomingHolidays();
        $this->testCalendarFeed();
        $this->testCalendarStats();

        echo "  Holiday Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testHolidaysRetrieval(): void
    {
        $res = $this->model->getAll(['year' => 2026]);
        $this->assert($res['total'] >= 10, '2026 holidays retrieved (count: ' . $res['total'] . ')');

        $names = array_column($res['data'], 'name');
        $this->assert(in_array("New Year's Day", $names), "Contains New Year's Day");
        $this->assert(in_array("Labor Day", $names), "Contains Labor Day");
        $this->assert(in_array("Christmas Day", $names), "Contains Christmas Day");
    }

    private function testHolidayFilters(): void
    {
        $statutory = $this->model->getAll(['year' => 2026, 'type' => 'Statutory']);
        $this->assert($statutory['total'] >= 6, 'Filtered statutory holidays count >= 6 (found: ' . $statutory['total'] . ')');

        $optional = $this->model->getAll(['year' => 2026, 'type' => 'Optional']);
        $this->assert($optional['total'] >= 2, 'Filtered optional holidays count >= 2 (found: ' . $optional['total'] . ')');

        $search = $this->model->getAll(['search' => 'Thanksgiving']);
        $this->assert($search['total'] >= 1, 'Search by keyword found Thanksgiving');
    }

    private function testHolidayCrud(): void
    {
        $testDate = '2026-08-15';
        $id = $this->model->create([
            'name'             => 'Founder Appreciation Day',
            'holiday_date'     => $testDate,
            'type'             => 'Observance',
            'is_mandatory_off' => 1,
            'description'      => 'Annual company anniversary and founder celebration'
        ]);

        $this->assert($id > 0, 'Created custom holiday with ID: ' . $id);

        $fetched = $this->model->findById($id);
        $this->assert($fetched !== null && $fetched['day_name'] === 'Saturday', 'Correctly computed day name as Saturday');

        $updated = $this->model->update($id, ['description' => 'Updated celebration note']);
        $this->assert($updated === true, 'Updated holiday record description');

        $deleted = $this->model->delete($id);
        $this->assert($deleted === true, 'Deleted custom holiday record');
    }

    private function testUpcomingHolidays(): void
    {
        $upcoming = $this->model->getUpcoming(5);
        $this->assert(is_array($upcoming), 'Upcoming holidays query returned list');
        if (count($upcoming) > 0) {
            $this->assert(isset($upcoming[0]['days_remaining']), 'Upcoming holiday contains days_remaining countdown');
        }
    }

    private function testCalendarFeed(): void
    {
        // Query September 2026
        $feed = $this->model->getCalendarFeed(2026, 9);
        $this->assert(isset($feed['events_by_day']), 'Calendar feed contains events_by_day map');
        $this->assert(count($feed['holidays']) >= 1, 'September has at least 1 holiday (Labor Day)');

        // Check that 2026-09-07 has Labor Day
        $hasLaborDay = false;
        if (!empty($feed['events_by_day']['2026-09-07'])) {
            foreach ($feed['events_by_day']['2026-09-07'] as $ev) {
                if ($ev['title'] === 'Labor Day') {
                    $hasLaborDay = true;
                    break;
                }
            }
        }
        $this->assert($hasLaborDay, 'Labor Day plotted on 2026-09-07 in calendar feed');
    }

    private function testCalendarStats(): void
    {
        $stats = $this->model->getStats(2026);
        $this->assert($stats['total_holidays'] >= 10, 'Stats total_holidays >= 10');
        $this->assert($stats['statutory_count'] >= 6, 'Stats statutory_count >= 6');
        $this->assert($stats['working_days_month'] > 15, 'Calculated valid working days for current month: ' . $stats['working_days_month']);
    }
}
