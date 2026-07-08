<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->integer('priority')->default(0)->after('id');
        });

        // Populate existing blogs with incremental priority based on their id
        $blogs = DB::table('blogs')->orderBy('id')->get();
        foreach ($blogs as $index => $blog) {
            DB::table('blogs')->where('id', $blog->id)->update(['priority' => $index + 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn('priority');
        });
    }
};
